// Time to impact, spacewalk conflict, act onboard or ask ground, and who to involve (Appendix A.7).
const { toMin } = require('./time');

function nextEvent(S, ladder) {
  let best = null;
  (S.ctx.events || []).forEach((e) => {
    if (!ladder.affects || !ladder.affects.includes(e.type) || !e.crew.includes(S.crew)) return;
    const te = toMin(e.day, e.time);
    if (te < S.now) return;
    if (!best || te < best.t) best = { t: te, event: e };
  });
  return best;
}

function whoFor(alert) {
  if (alert.private) return alert.shared ? 'Shared with the crew medical officer.' : 'Only you can see this.';
  if (alert.level === 'WARNING') return 'Crew medical officer now. Queued for the flight surgeon.';
  if (alert.level === 'CAUTION') return 'Tell the crew medical officer.';
  return 'You. Log it.';
}

// Adds the escalation fields to an alert that already has level, private and shared.
function escalate(S, ladder, alert) {
  const hit = nextEvent(S, ladder);
  const event = hit ? hit.event : null;
  const roundTripS = 2 * S.ctx.delay_s;                                           // CLAUDE.md step 1f
  alert.time_to_impact_min = hit ? hit.t - S.now : 2880;                           // none: 48 h
  alert.conflict = event && event.type === 'EVA' ? { type: 'EVA', day: event.day, time: event.time } : null;
  alert.escalation = (S.ctx.link_down || roundTripS > alert.time_to_impact_min * 60) ? 'act_onboard' : 'ask_ground';
  alert.reply_min = Math.round(roundTripS / 60);
  if (alert.escalation === 'act_onboard') {
    alert.escalation_text = 'Act onboard now';
    if (S.ctx.link_down) alert.escalation_reason = 'The link to Earth is down.';
    else alert.escalation_reason = event && event.type === 'EVA' ? 'Earth cannot answer before the spacewalk at ' + event.time + '.' : 'Earth cannot answer before the landing.';
  } else {
    alert.escalation_text = alert.reply_min >= 1 ? 'Ask ground: reply in about ' + alert.reply_min + ' min' : 'Ask ground: reply in under 1 min';
    alert.escalation_reason = 'Earth can answer in time.';
  }
  alert.who = whoFor(alert);
}

module.exports = { escalate };
