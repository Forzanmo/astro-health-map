// What the flight surgeon on Earth has or will get: queue, delay and link state (Appendix A.9).
const { PROFILES } = require('./constants');
const { tLabel } = require('./time');

const shownDelayMs = (S) => PROFILES[S.ctx.profile].shown_delay_s * 1000;

// Queue a WARNING once, when it opens or rises to WARNING, unless it is private and not shared.
function queueIfNeeded(S, alert, nowMs) {
  const eligible = alert.level === 'WARNING' && (!alert.private || alert.shared);
  if (!eligible) { delete S.queued[alert.id]; return; }
  if (S.queued[alert.id] === 'WARNING') return;
  S.queued[alert.id] = 'WARNING';
  S.ground.push({ alert_id: alert.id, level: alert.level, what: alert.what, data_as_of: tLabel(S.now),
    status: S.ctx.link_down ? 'held_link_down' : 'in_transit', due: nowMs + shownDelayMs(S) });
}

// Turn in-transit items whose delay has passed into delivered. Returns true when something changed.
function deliverDue(S, nowMs) {
  let changed = false;
  S.ground.forEach((g) => { if (g.status === 'in_transit' && nowMs >= g.due) { g.status = 'delivered'; changed = true; } });
  return changed;
}

function applyLink(S, nowMs) {
  S.ground.forEach((g) => {
    if (S.ctx.link_down && g.status === 'in_transit') g.status = 'held_link_down';
    else if (!S.ctx.link_down && g.status === 'held_link_down') { g.status = 'in_transit'; g.due = nowMs + shownDelayMs(S); }
  });
}

const hasInTransit = (S) => S.ground.some((g) => g.status === 'in_transit');
const view = (S) => S.ground.map((g) => ({ alert_id: g.alert_id, level: g.level, what: g.what, data_as_of: g.data_as_of, status: g.status })).reverse();

module.exports = { queueIfNeeded, deliverDue, applyLink, hasInTransit, view };
