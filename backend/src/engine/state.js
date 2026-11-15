// Assembles the objects of the contract (4.5) from the engine's internals. The only place that builds them.
const { RANK, PROFILES, PHASES, METRICS, DEVICES, LADDERS, REGIONS, CARDS, BASE_METRICS } = require('./constants');
const { RULES, LADDER_RULES } = require('./rules');
const { sortAlerts } = require('./priority');
const { round } = require('./scenario');
const { toMin, hhmm, dayOf, tLabel } = require('./time');
const ground = require('./ground');
const { notFoundError } = require('../errors');

const worst = (a, b) => (RANK[a] >= RANK[b] ? a : b);
const sorted = (S) => sortAlerts(Object.values(S.alerts));

function latestOf(S, metric) {
  for (let i = S.vis.length - 1; i >= 0; i -= 1) if (S.vis[i].metric === metric) return S.vis[i];
  return null;
}

function levelOfLadders(S, ladderIds) {
  return ladderIds.reduce((lvl, id) => { const a = S.alerts[S.crew + '-' + id]; return a ? worst(lvl, a.level) : lvl; }, 'OK');
}

// The public Alert of the contract: internal fields such as `order` are left out.
const ALERT_FIELDS = ['id', 'ladder', 'rule_id', 'level', 'what', 'why', 'note', 'provenance', 'do_now', 'source', 'evidence_class', 'design',
  'region', 'metrics', 'private', 'shared', 'refired', 'conflict', 'time_to_impact_min', 'escalation', 'escalation_text', 'escalation_reason',
  'reply_min', 'who', 'priority'];
const publicAlert = (a) => ALERT_FIELDS.reduce((o, k) => { o[k] = a[k]; return o; }, {});

function buildContext(S) {
  const alerts = sorted(S);
  return {
    crew_id: S.crew, profile: S.ctx.profile, delay_s: S.ctx.delay_s, shown_delay_s: PROFILES[S.ctx.profile].shown_delay_s,
    link_down: S.ctx.link_down, phase: S.ctx.phase, phase_label: PHASES[S.ctx.phase].label, day: dayOf(S.now), time: hhmm(S.now),
    events: S.ctx.events.map((e) => ({
      type: e.type, day: e.day, time: e.time, crew: e.crew.slice(),
      level: alerts.reduce((lvl, a) => (a.conflict && e.type === 'EVA' && a.conflict.day === e.day && a.conflict.time === e.time ? worst(lvl, a.level) : lvl), 'OK'),
      past: toMin(e.day, e.time) < S.now
    })),
    scenario: S.scenario, gravity: PHASES[S.ctx.phase].gravity                       // v1.1 additions
  };
}

function buildVitals(S) {
  const today = dayOf(S.now);
  return CARDS.map((c) => {
    const first = c.parts[0]; const second = c.parts[1];
    const o = latestOf(S, first); const o2 = second ? latestOf(S, second) : null;
    const b = S.base[first]; const b2 = second ? S.base[second] : null;
    const trend = [];
    for (let d = today - 6; d <= today; d += 1) {
      let v = null;
      S.vis.forEach((x) => { if (x.metric === first && dayOf(x.t) === d) v = x.value; });
      trend.push(v);
    }
    return {
      id: c.id, label: c.label, unit: c.unit, value: o ? o.value : null, value2: o2 ? o2.value : null, provenance: o ? o.provenance : null,
      base_mean: b ? round(b.mean, METRICS[first].decimals) : null, base_sd: b ? round(b.sd, Math.max(1, METRICS[first].decimals)) : null,
      base_mean2: b2 ? round(b2.mean, 0) : null, base_sd2: b2 ? round(b2.sd, 1) : null,
      level: o ? levelOfLadders(S, c.ladders) : 'NONE', trend7d: trend
    };
  });
}

function readingOf(S, metric) {
  const o = latestOf(S, metric); const m = METRICS[metric];
  return { metric, label: m.label, unit: m.unit, value: o ? o.value : null, provenance: o ? o.provenance : null, at: o ? tLabel(o.t) : null };
}

function regionLevel(S, region) {
  let level = region.metrics.some((m) => latestOf(S, m)) ? 'OK' : 'NONE';
  const ids = [];
  LADDERS.forEach((l) => { const a = S.alerts[S.crew + '-' + l.id]; if (a && l.region === region.id) { level = worst(level, a.level); ids.push(a.id); } });
  return { level, ids };
}

function buildRegions(S) {
  return REGIONS.map((r) => {
    const { level, ids } = regionLevel(S, r);
    return { id: r.id, label: r.label, level, alert_ids: ids, readings: r.metrics.map((m) => readingOf(S, m)),
      measured: r.metrics.length > 0 };                                               // v1.1 addition
  });
}

function buildState(S, pending, liveFrame) {
  return {
    contract_version: '1.1', session_started_at: S.startedAt, version: S.version, pending,
    context: buildContext(S), vitals: buildVitals(S), regions: buildRegions(S),
    alerts: sorted(S).map(publicAlert), ground: ground.view(S),
    stand_test: S.stand ? { fired: S.stand.fired, hr_rise: S.stand.hr_rise, sys_drop: S.stand.sys_drop, dia_drop: S.stand.dia_drop, readiness: S.stand.readiness } : null,
    live: liveFrame                                                                   // v1.1 addition
  };
}

// ---- v1.1: detail for one body region, for the click on the body figure
function metricDetail(S, metric, liveValues) {
  const m = METRICS[metric]; const o = latestOf(S, metric); const b = S.base[metric];
  const ladders = LADDERS.filter((l) => l.metrics.includes(metric)).map((l) => l.id);
  const history = S.vis.filter((x) => x.metric === metric && x.t >= 0).slice(-24)
    .map((x) => ({ at: tLabel(x.t), ts_utc: x.ts_utc, value: x.value, provenance: x.provenance, device: x.device }));
  return {
    metric, label: m.label, unit: m.unit, value: o ? o.value : null, provenance: o ? o.provenance : null, at: o ? tLabel(o.t) : null,
    live: m.live, live_value: m.live && liveValues ? liveValues[metric] : null,
    device: { id: m.device, name: DEVICES[m.device].name, simulated: true },
    base_mean: b ? round(b.mean, m.decimals) : null, base_sd: b ? round(b.sd, Math.max(1, m.decimals)) : null,
    baseline_low: b ? round(b.mean - 2 * b.sd, m.decimals) : null, baseline_high: b ? round(b.mean + 2 * b.sd, m.decimals) : null,
    deviation_sd: b && o && b.sd > 0 ? round((o.value - b.mean) / b.sd, 1) : null,
    level: o ? levelOfLadders(S, ladders) : 'NONE', history
  };
}

function buildRegionDetail(S, id, liveValues) {
  const region = REGIONS.find((r) => r.id === id);
  if (!region) throw notFoundError('No body region has this id.');
  const { level, ids } = regionLevel(S, region);
  const ruleIds = [];
  LADDERS.filter((l) => l.region === id).forEach((l) => LADDER_RULES[l.id].forEach((r) => { if (!ruleIds.includes(r)) ruleIds.push(r); }));
  return {
    id: region.id, label: region.label, level, measured: region.metrics.length > 0, note: region.note,
    metrics: region.metrics.map((m) => metricDetail(S, m, liveValues)),
    alerts: sorted(S).filter((a) => ids.includes(a.id)).map(publicAlert),
    rules: ruleIds.map((r) => ({ rule_id: r, fires_when: RULES[r].fires_when, level: RULES[r].level, source: RULES[r].source, evidence_class: RULES[r].evidence_class, design: RULES[r].design })),
    baseline_band_note: 'The baseline band is the pre-flight mean plus or minus 2 SD. It is our own choice (DESIGN).'
  };
}

function buildDevices(S) {
  return Object.keys(DEVICES).map((id) => {
    const metrics = Object.keys(METRICS).filter((m) => METRICS[m].device === id);
    const latest = metrics.map((m) => latestOf(S, m)).filter(Boolean).sort((a, b) => b.t - a.t)[0];
    return { id, name: DEVICES[id].name, simulated: true, connection_state: 'connected', last_reading_at: latest ? tLabel(latest.t) : null,
      metrics: metrics.map((m) => ({ metric: m, label: METRICS[m].label, live: METRICS[m].live })) };
  });
}

function buildRecords(S, query) {
  const q = query || {};
  const limit = Math.min(500, Math.max(1, parseInt(q.limit, 10) || 100));
  const regionOf = (metric) => { const r = REGIONS.find((x) => x.metrics.includes(metric)); return r ? r.id : null; };
  return S.vis.filter((o) => o.t >= 0 && (!q.metric || o.metric === q.metric)).slice(-limit).reverse().map((o) => {
    const m = METRICS[o.metric]; const b = BASE_METRICS.includes(o.metric) ? S.base[o.metric] : null;
    return { at: tLabel(o.t), ts_utc: o.ts_utc, region: regionOf(o.metric), metric: o.metric, label: m.label, value: o.value, unit: m.unit,
      baseline_low: b ? round(b.mean - 2 * b.sd, m.decimals) : null, baseline_high: b ? round(b.mean + 2 * b.sd, m.decimals) : null,
      deviation_sd: b && b.sd > 0 ? round((o.value - b.mean) / b.sd, 1) : null, device: o.device, provenance: o.provenance };
  });
}

module.exports = { buildState, buildRegionDetail, buildDevices, buildRecords, latestOf };
