// One check per ladder: visible readings in, finding or nothing out (Appendix A.5). Thresholds from CLAUDE.md step 1c.
const { METRICS, BASE_METRICS, PHASES } = require('./constants');
const { round, mean } = require('./scenario');

const last = (a) => a[a.length - 1];
const signed = (z) => (z >= 0 ? '+' : '') + z.toFixed(1);
const CO2_NOTE = 'We flag headache risk only.';

function fluxFinding(series) {
  if (!series.length) return null;
  const f = last(series);
  if (f.value >= 1000) return { rule: 'M1-c', prov: f.provenance, what: 'Solar storm: proton flux passed the S3 level.', why: 'Proton flux is ' + f.value + ' pfu. The S3 level starts at 1000 pfu.' };
  if (f.value >= 10) return { rule: 'M1-b', prov: f.provenance, what: 'Solar storm watch: proton flux passed the S1 level.', why: 'Proton flux is ' + f.value + ' pfu. The S1 level starts at 10 pfu.' };
  return null;
}

function sleepFinding(series) {
  const flight = series.filter((o) => o.t >= 0);
  if (flight.length < 3) return null;
  const l3 = flight.slice(-3);
  if (!l3.every((o) => o.value < 6)) return null;
  return { rule: 'M2-a', prov: last(l3).provenance, what: 'Short sleep three nights in a row.', why: 'Last 3 nights: ' + l3.map((o) => o.value).join(', ') + ' h. The rule is 3 nights under 6 h.' };
}

function co2Finding(series, now) {
  if (!series.length) return null;
  const h1 = series.filter((o) => o.t > now - 60).map((o) => o.value);
  const d7 = series.filter((o) => o.t > now - 7 * 1440).map((o) => o.value);
  const prov = last(series).provenance;
  if (h1.length && mean(h1) > 3) return { rule: 'M3-a', prov, what: 'Cabin CO2 is above the 1-hour limit.', why: 'The 1-hour mean is ' + round(mean(h1), 2) + ' mmHg. The limit is 3 mmHg.', note: CO2_NOTE };
  if (d7.length && mean(d7) > 2.5) return { rule: 'M3-b', prov, what: 'Cabin CO2 has been raised for a week.', why: 'The 7-day mean is ' + round(mean(d7), 2) + ' mmHg. The watch level is 2.5 mmHg.', note: CO2_NOTE };
  return null;
}

function standFinding(stand) {
  if (!stand || !stand.fired) return null;
  const why = stand.hr_rise >= 30
    ? 'Heart rate rose ' + stand.hr_rise + ' bpm within 3 min of standing. The rule is 30 bpm or more.'
    : 'Blood pressure fell ' + stand.sys_drop + '/' + stand.dia_drop + ' mmHg within 3 min of standing. The rule is 20/10 or more.';
  return { rule: 'M4-a', prov: stand.provenance || 'SIMULATED', what: 'Stand test: a large change on standing.', why };
}

function phqFinding(series) {
  if (!series.length || last(series).value < 3) return null;
  return { rule: 'M5-b', prov: last(series).provenance, what: 'PHQ-2 score suggests a longer check-in.', why: 'Your score is ' + last(series).value + ' of 6. At 3 or more, the PHQ-9 is offered.' };
}

function vitalFinding(metric, series, base, phase) {
  const flight = series.filter((o) => o.t >= 0);
  if (!flight.length || !base || !(base.sd > 0)) return null;
  const m = METRICS[metric];
  const zl = (last(flight).value - base.mean) / base.sd;
  const zp = flight.length >= 2 ? (flight[flight.length - 2].value - base.mean) / base.sd : 0;
  const baseText = round(base.mean, m.decimals) + ' ' + m.unit;
  const prov = last(flight).provenance;
  if (Math.abs(zl) >= 3) return { rule: 'V-2', prov, what: m.label + ' is far from your baseline.', why: 'The latest reading is ' + signed(zl) + ' SD from your pre-flight mean of ' + baseText + '.' };
  if (flight.length < 2 || Math.abs(zl) < 2 || Math.abs(zp) < 2) return null;
  const why = 'The last 2 readings were ' + signed(zp) + ' and ' + signed(zl) + ' SD from your pre-flight mean of ' + baseText + '.';
  const inFlight = PHASES[phase].in_flight;
  const isV3 = inFlight && ((metric === 'temp' && zl > 0 && zp > 0) || ((metric === 'bp_sys' || metric === 'bp_dia') && zl < 0 && zp < 0));
  if (isV3) {
    return { rule: 'V-3', prov, what: m.label + ' shifted in the direction seen in flight.', why,
      note: metric === 'temp'
        ? 'ESTIMATED context: resting core temperature rose about 1 °C over about 2.5 months on the ISS (Stahn 2017).'
        : 'ESTIMATED context: 24-hour systolic fell from about 120 to 106 mmHg in flight and returned after landing (Fu 2019).' };
  }
  return { rule: 'V-1', prov, what: m.label + ' is away from your baseline.', why,
    note: metric === 'glucose' ? 'Evidence of insulin resistance in flight is growing; no validated in-flight range.' : null };
}

// Returns { ladderId: finding }.
function findAll(S) {
  const ser = (metric) => S.vis.filter((o) => o.metric === metric);
  const F = {};
  const put = (id, f) => { if (f) F[id] = f; };
  put('flux', fluxFinding(ser('proton_pfu')));
  // 'dose' (M1-a) is not active: the projection method is not in our sources.
  put('sleep', sleepFinding(ser('sleep_h')));
  put('co2', co2Finding(ser('ppco2'), S.now));
  put('stand', standFinding(S.stand));
  put('phq', phqFinding(ser('phq2')));
  BASE_METRICS.forEach((m) => put('vital-' + m, vitalFinding(m, ser(m), S.base[m], S.ctx.phase)));
  return F;
}

module.exports = { findAll };
