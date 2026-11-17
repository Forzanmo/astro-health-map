// Seeded demo data for crew B (Appendix A.2). Every value is SIMULATED. Same seed, same data, every start.
const { CREW, SEED, METRICS, BASE_METRICS, SIM_BASE } = require('./constants');
const { toMin, tsOf } = require('./time');

function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (v, d) => { const p = 10 ** (d || 0); return Math.round(v * p) / p; };
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;

function makeObservation(metric, value, t, seq, extra = {}) {
  const m = METRICS[metric];
  return {
    crew_id: m.cabin ? 'CABIN' : (extra.crew_id || CREW), metric, value: round(value, m.decimals), unit: m.unit,
    ts_utc: tsOf(t), device: extra.device || m.device, provenance: extra.provenance || 'SIMULATED', t, seq
  };
}

// preset: 'normal' (everything fine), 'watch' (the demo story), 'problem' (watch plus three red findings).
function buildScenario(preset) {
  const next = mulberry32(SEED);
  const gauss = () => { let u = 0; let v = 0; while (u === 0) u = next(); while (v === 0) v = next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const obs = [];
  const add = (metric, value, t) => obs.push(makeObservation(metric, value, t, obs.length));
  const clockOf = (m) => (m === 'sleep_h' ? '07:00' : '08:00');
  const story = preset !== 'normal';

  // 1. Pre-flight: 28 days of the six vitals.
  for (let d = -28; d <= -1; d += 1) {
    BASE_METRICS.forEach((m) => add(m, SIM_BASE[m][0] + SIM_BASE[m][1] * gauss(), toMin(d, clockOf(m))));
  }
  // 2. Baseline: mean and sample SD per metric.
  const base = {};
  BASE_METRICS.forEach((m) => {
    const vals = obs.filter((o) => o.metric === m).map((o) => o.value);
    const mu = mean(vals);
    base[m] = { mean: mu, sd: Math.sqrt(vals.reduce((s, v) => s + (v - mu) ** 2, 0) / (vals.length - 1)), n: vals.length };
  });
  // 3. In flight: days 128 to 142, close to baseline unless the story says otherwise.
  for (let d = 128; d <= 142; d += 1) {
    BASE_METRICS.forEach((m) => {
      const b = base[m];
      let z = Math.max(-1.2, Math.min(1.2, 0.6 * gauss()));
      if (m === 'sleep_h') z = Math.max(-0.6, z);
      let value = b.mean + b.sd * z;
      if (story && m === 'sleep_h' && d >= 140) value = 5.2;                           // nights of days 139 to 141
      if (story && m === 'glucose' && d === 139) value = b.mean + 1.3 * b.sd;
      if (story && m === 'glucose' && d >= 140) value = Math.ceil(b.mean + 2.15 * b.sd);   // about +2.2 SD
      if (preset === 'problem' && m === 'hr' && d === 142) value = Math.ceil(b.mean + 3.2 * b.sd);
      add(m, value, toMin(d, clockOf(m)));
    });
    add('proton_pfu', 0.2 + 0.3 * next(), toMin(d, '08:00'));                            // quiet Sun
  }
  // 4. Cabin CO2, hourly from day 135 to the end of day 142.
  const t0 = toMin(135, '00:00'); const knee = toMin(142, '09:30'); const t1 = toMin(142, '23:00');
  for (let t = t0; t <= t1; t += 60) {
    let c = 2.2;                                                                        // normal: flat
    if (story) c = t <= knee ? 2.2 + 0.75 * (t - t0) / (knee - t0) : 2.95 + 0.45 * (t - knee) / (t1 - knee);
    if (preset === 'problem' && t >= toMin(142, '06:00')) c = 3.4;
    add('ppco2', c, t);
  }
  // 5. Problem preset: the storm has already reached S3 before the session starts.
  if (preset === 'problem') {
    add('proton_pfu', 12, toMin(142, '11:20'));
    add('proton_pfu', 1200, toMin(142, '11:25'));
  }
  return { obs, base };
}

module.exports = { buildScenario, makeObservation, round, mean };
