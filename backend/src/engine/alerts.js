// From findings to alerts: one alert per ladder, with its lifecycle (Appendix A.6).
const { LADDERS, RANK } = require('./constants');
const { RULES } = require('./rules');
const { findAll } = require('./findings');
const { escalate } = require('./escalation');
const { priorityOf } = require('./priority');
const { actionsFor } = require('./content');
const ground = require('./ground');

// Rebuilds S.vis and S.alerts from the stored readings. Call after every change.
function evaluate(S, nowMs) {
  S.vis = S.obs
    .filter((o) => o.t <= S.now && (o.crew_id === S.crew || o.crew_id === 'CABIN'))
    .sort((a, b) => a.t - b.t || a.seq - b.seq);
  const found = findAll(S);
  const next = {};
  LADDERS.forEach((ladder, order) => {
    const id = S.crew + '-' + ladder.id;
    const f = found[ladder.id];
    if (!f) { delete S.queued[id]; return; }
    const rule = RULES[f.rule];
    const prev = S.alerts[id];
    const alert = {
      id, ladder: ladder.id, rule_id: f.rule, level: rule.level, what: f.what, why: f.why, note: f.note || null, provenance: f.prov,
      do_now: actionsFor(ladder.id, f.rule), source: rule.source, evidence_class: rule.evidence_class, design: rule.design,
      region: ladder.region, metrics: ladder.metrics.slice(), private: !!ladder.isPrivate, shared: !!S.shared[id],
      refired: prev ? (prev.refired || RANK[rule.level] > RANK[prev.level]) : false, order
    };
    escalate(S, ladder, alert);
    alert.priority = priorityOf(alert, rule.module, S.ctx.phase);
    ground.queueIfNeeded(S, alert, nowMs);
    next[id] = alert;
  });
  S.alerts = next;
}

module.exports = { evaluate };
