// Input checks and their messages (Appendix A.14). The value rules are input checks only, not medical limits.
const { validation } = require('../errors');
const { METRICS, PROVENANCE, PROFILES, PHASES, SCENARIOS } = require('./constants');
const { tOfTs } = require('./time');

function checkReading(input, nowT) {
  const src = input || {};
  const m = METRICS[src.metric];
  if (!m) throw validation('Unknown metric.', 'metric');
  const value = src.value;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw validation('Value is not a number.', 'value');
  if (value < 0) throw validation('Value cannot be negative.', 'value');
  if (src.metric === 'mood' && value > 100) throw validation('Mood must be between 0 and 100.', 'value');
  if (src.metric === 'phq2' && (!Number.isInteger(value) || value > 6)) throw validation('PHQ-2 must be a whole number from 0 to 6.', 'value');
  const provenance = src.provenance || 'SIMULATED';
  if (!PROVENANCE.includes(provenance)) throw validation('Unknown provenance.', 'provenance');
  let t = nowT;
  if (src.ts_utc) { const parsed = tOfTs(src.ts_utc); if (Number.isFinite(parsed)) t = parsed; }
  const device = typeof src.device === 'string' && src.device ? src.device.slice(0, 40) : 'manual';
  return { metric: src.metric, value, t, device, provenance };
}

function checkContext(change) {
  const c = change || {};
  const out = {};
  if (c.profile !== undefined) { if (!PROFILES[c.profile]) throw validation('Unknown profile.', 'profile'); out.profile = c.profile; }
  if (c.link_down !== undefined) { if (typeof c.link_down !== 'boolean') throw validation('Link down must be true or false.', 'link_down'); out.link_down = c.link_down; }
  if (c.phase !== undefined) { if (!PHASES[c.phase]) throw validation('Unknown phase.', 'phase'); out.phase = c.phase; }
  if (c.day !== undefined) {
    const day = typeof c.day === 'string' && c.day.trim() !== '' ? Number(c.day) : c.day;
    if (!Number.isInteger(day) || day < 128 || day > 142) throw validation('Day must be a whole number from 128 to 142.', 'day');
    out.day = day;
  }
  if (c.time !== undefined) {
    if (typeof c.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(c.time)) throw validation('Time must look like HH:MM.', 'time');
    out.time = c.time;
  }
  if (!Object.keys(out).length) throw validation('Send at least one field.');
  return out;
}

function checkScenario(body, current) {
  const s = body && body.scenario;
  if (s === undefined || s === null) return current;
  if (!SCENARIOS.includes(s)) throw validation('Unknown scenario.', 'scenario');
  return s;
}

module.exports = { checkReading, checkContext, checkScenario };
