// Priority score and alert order (CLAUDE.md step 1g, contract 4.7 rule 1).
const { RANK, LEVEL_WEIGHT } = require('./constants');
const { PHASE_WEIGHTS } = require('./rules');

function phaseWeight(module, phase) {
  const p = PHASE_WEIGHTS[phase];
  return p && p[module] !== undefined ? p[module] : 1.0;
}

function priorityOf(alert, module, phase) {
  const urgency = alert.time_to_impact_min < 720 ? 3 : (alert.time_to_impact_min < 2880 ? 1 : 0);
  return LEVEL_WEIGHT[alert.level] * phaseWeight(module, phase) + urgency + (alert.escalation === 'act_onboard' ? 1 : 0);
}

const sortAlerts = (list) => list.sort((a, b) => b.priority - a.priority || RANK[b.level] - RANK[a.level] || a.order - b.order);

module.exports = { priorityOf, sortAlerts };
