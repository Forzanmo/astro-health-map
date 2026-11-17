// The live signal: a smooth, seeded sensor trace around each metric's latest stored reading.
// It is presentation only. Rules and alerts never read it, so a status cannot flicker.
const { METRICS, SEED } = require('./constants');

const LIVE_METRICS = Object.keys(METRICS).filter((m) => METRICS[m].live);
const PERIODS_S = [1.3, 3.1, 7.3, 17.9];      // four waves give a smooth trace that does not visibly repeat
const WEIGHTS = [0.12, 0.45, 0.28, 0.15];     // they add up to 1, so the trace stays inside the amplitude
const EASE_S = 0.6;                            // how fast the trace glides to a new reading

function seededPhases() {
  let a = SEED ^ 0x9e3779b9;
  const next = () => { a = (Math.imul(a, 1664525) + 1013904223) | 0; return ((a >>> 0) / 4294967296) * 2 * Math.PI; };
  const phases = {};
  LIVE_METRICS.forEach((m) => { phases[m] = PERIODS_S.map(() => next()); });
  return phases;
}

// Size of the wobble. Vitals move by a quarter of the astronaut's own SD; cabin values by a small fixed share.
function amplitude(metric, anchor, base) {
  if (base && base.sd > 0) return 0.25 * base.sd;
  if (metric === 'ppco2') return 0.02;
  return Math.max(0.02, Math.abs(anchor) * 0.06);
}

function createLive() {
  const phases = seededPhases();
  const current = {};
  let lastMs = null; let seq = 0;

  // anchors: { metric: latest stored value or null }. Returns { metric: number or null }.
  function frame(nowMs, anchors, baselines) {
    const dt = lastMs === null ? 0 : Math.max(0, (nowMs - lastMs) / 1000);
    lastMs = nowMs; seq += 1;
    const k = 1 - Math.exp(-dt / EASE_S);                         // 0 when no time has passed
    const tS = nowMs / 1000;
    const values = {};
    LIVE_METRICS.forEach((m) => {
      const anchor = anchors[m];
      if (anchor === null || anchor === undefined) { values[m] = null; current[m] = undefined; return; }
      const wave = PERIODS_S.reduce((s, p, i) => s + WEIGHTS[i] * Math.sin((2 * Math.PI * tS) / p + phases[m][i]), 0);
      const target = Math.max(0, anchor + amplitude(m, anchor, baselines[m]) * wave);
      current[m] = current[m] === undefined ? target : current[m] + (target - current[m]) * k;
      const p = 10 ** (METRICS[m].decimals + 2);                  // two more decimals than the stored reading, so every frame moves
      values[m] = Math.round(current[m] * p) / p;
    });
    return { seq, values };
  }
  return { frame };
}

module.exports = { createLive, LIVE_METRICS };
