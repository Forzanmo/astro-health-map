// "Do now" action texts. First item is the action, the others are alternatives.
// TODO-SOURCE: replace with the blueprint action library (section 7). Until then these come from the
// research report (section 5) and the problem definition (phase 6).
const ACTIONS = {
  flux: {
    'M1-b': ['Check that the storm shelter is ready and keep watching the flux.'],
    'M1-c': ['Move to the storm shelter now.', 'Postpone the spacewalk.'],
    default: ['Move to the storm shelter now.']
  },
  sleep: { default: ['Follow the sleep schedule tonight and adjust the light plan.', 'Ask the crew medical officer about the spacewalk assignment.'] },
  co2: { default: ['Log any headache and tell the crew medical officer.'] },
  stand: { default: ['Stay lying back and stand only with help.', 'Use the compression garment.'] },
  phq: { default: ['Take the PHQ-9 when you are ready.', 'Share the result with the crew medical officer.'] },
  vital: { default: ['Take the reading again.', 'Tell the crew medical officer if it repeats.'] }
};

function actionsFor(ladderId, ruleId) {
  const set = ACTIONS[ladderId.startsWith('vital-') ? 'vital' : ladderId] || {};
  return (set[ruleId] || set.default || ['TODO-SOURCE: copy the action from the blueprint action library.']).slice(0, 3);
}

module.exports = { actionsFor };
