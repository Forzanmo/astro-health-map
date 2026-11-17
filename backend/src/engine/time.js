// Mission time helpers. t is whole minutes since launch; pre-flight days are negative.
const MISSION_START_UTC = Date.UTC(2031, 0, 1);   // simulated launch instant, only used to fill ts_utc

const two = (n) => (n < 10 ? '0' : '') + n;
function toMin(day, hhmm) { const p = String(hhmm).split(':'); return day * 1440 + Number(p[0]) * 60 + (Number(p[1]) || 0); }
function hhmm(t) { const m = ((t % 1440) + 1440) % 1440; return two(Math.floor(m / 60)) + ':' + two(m % 60); }
const dayOf = (t) => Math.floor(t / 1440);
const tLabel = (t) => 'Day ' + dayOf(t) + ' ' + hhmm(t);
const tsOf = (t) => new Date(MISSION_START_UTC + t * 60000).toISOString();
const tOfTs = (ts) => Math.round((Date.parse(ts) - MISSION_START_UTC) / 60000);

module.exports = { toMin, hhmm, dayOf, tLabel, tsOf, tOfTs };
