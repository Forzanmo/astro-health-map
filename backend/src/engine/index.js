// createEngine({ clock, scenario }): the engine's public methods. Pure domain logic: no Express, no process.env, no Date.now().
const { CREW, DEMO_START, PROFILES, METRICS } = require('./constants');
const { buildScenario, makeObservation } = require('./scenario');
const { evaluate } = require('./alerts');
const ground = require('./ground');
const { checkReading, checkContext, checkScenario } = require('./validate');
const { parseDeviceCsv } = require('./csv');
const { builtInRows, evaluateStand } = require('./standTest');
const { createLive, LIVE_METRICS } = require('./live');
const state = require('./state');
const { toMin, hhmm, dayOf } = require('./time');
const { notFoundError } = require('../errors');

function createEngine({ clock, scenario = 'watch' }) {
  const live = createLive();
  const startedAt = new Date(clock.nowMs()).toISOString();
  let S = null;
  let version = 0;

  function load(preset) {
    const data = buildScenario(preset);
    S = {
      crew: CREW, scenario: preset, startedAt, obs: data.obs, base: data.base, seq: data.obs.length, vis: [],
      now: toMin(DEMO_START.day, DEMO_START.time), alerts: {}, ground: [], queued: {}, shared: {}, stand: null, stormDueMs: null,
      ctx: { profile: 'MARS', delay_s: PROFILES.MARS.delay_s, link_down: false, phase: 'P5b',
        events: [{ type: 'EVA', day: 142, time: '12:00', crew: ['B', 'C'] }] }
    };
    changed();
  }

  // Re-evaluate after any change and bump the version.
  function changed() { evaluate(S, clock.nowMs()); version += 1; S.version = version; }

  const store = (metric, value, t, extra) => { S.obs.push(makeObservation(metric, value, t, S.seq, extra)); S.seq += 1; };

  // Timed changes are applied when state is read, so the engine needs no background timer.
  function applyTimed() {
    const nowMs = clock.nowMs();
    let touched = false;
    if (S.stormDueMs !== null && nowMs >= S.stormDueMs) { store('proton_pfu', 1200, S.now, { device: 'sim' }); S.stormDueMs = null; touched = true; }
    if (ground.deliverDue(S, nowMs)) touched = true;
    if (touched) changed();
  }

  const pending = () => S.stormDueMs !== null || ground.hasInTransit(S);

  function liveFrame() {
    const anchors = {};
    LIVE_METRICS.forEach((m) => { const o = state.latestOf(S, m); anchors[m] = o ? o.value : null; });
    const f = live.frame(clock.nowMs(), anchors, S.base);
    return { seq: f.seq, server_ms: clock.nowMs(), interval_ms: 100, version, pending: pending(), provenance: 'SIMULATED', values: f.values };
  }

  load(scenario);

  return {
    getState() { applyTimed(); return state.buildState(S, pending(), liveFrame()); },

    getLiveFrame() { applyTimed(); return liveFrame(); },

    addObservation(input) {
      const r = checkReading(input, S.now);
      store(r.metric, r.value, r.t, { device: r.device, provenance: r.provenance });
      changed();
      return { added: 1 };
    },

    importCsv(text) {
      const { readings, errors } = parseDeviceCsv(text, S.crew);
      let added = 0;
      readings.forEach(({ row, input }) => {
        try { const r = checkReading(input, S.now); store(r.metric, r.value, r.t, { device: r.device, provenance: r.provenance }); added += 1; }
        catch (e) { errors.push({ row, message: e.message }); }
      });
      errors.sort((a, b) => a.row - b.row);
      changed();
      return { added, rejected: errors.length, errors };
    },

    setContext(change) {
      const c = checkContext(change);
      if (c.profile) { S.ctx.profile = c.profile; S.ctx.delay_s = PROFILES[c.profile].delay_s; }
      if (c.link_down !== undefined) { S.ctx.link_down = c.link_down; ground.applyLink(S, clock.nowMs()); }
      if (c.day !== undefined || c.time !== undefined) S.now = toMin(c.day !== undefined ? c.day : dayOf(S.now), c.time !== undefined ? c.time : hhmm(S.now));
      if (c.phase) {
        S.ctx.phase = c.phase;
        S.ctx.events = S.ctx.events.filter((e) => e.type !== 'LANDING');
        if (c.phase === 'P6') S.ctx.events.push({ type: 'LANDING', day: dayOf(S.now), time: hhmm(S.now), crew: ['A', 'B', 'C', 'D'] });
      }
      changed();
      return null;
    },

    // Flux crosses S1 now and S3 after 1.5 s of real time. Both readings are SIMULATED.
    triggerStorm() {
      store('proton_pfu', 12, S.now, { device: 'sim' });
      S.stormDueMs = clock.nowMs() + 1500;
      changed();
      return null;
    },

    reset(body) { load(checkScenario(body, S.scenario)); return null; },

    runStandTest(rows) {
      const used = Array.isArray(rows) && rows.length ? rows : builtInRows();
      S.stand = evaluateStand(used);
      changed();
      const { provenance, ...result } = S.stand;
      return { ...result, rows: used };
    },

    shareAlert(alertId) {
      if (!S.alerts[alertId]) throw notFoundError('No open alert has this id.');
      S.shared[alertId] = true;
      changed();
      return null;
    },

    // v1.1 additions
    getRegionDetail(id) { applyTimed(); return state.buildRegionDetail(S, id, liveFrame().values); },
    getDevices() { return state.buildDevices(S); },
    getRecords(query) { return state.buildRecords(S, query); },

    // For scripts and tests only.
    _baseline() { return JSON.parse(JSON.stringify(S.base)); },
    _metrics: METRICS
  };
}

module.exports = { createEngine };
