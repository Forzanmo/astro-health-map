// constants.js: every fixed word, id and label the ui modules print.
export const STATUS = {
  NONE:     { word: 'No data', cls: 's-none' },
  OK:       { word: 'Fine',    cls: 's-fine' },
  ADVISORY: { word: 'Watch',   cls: 's-watch' },
  CAUTION:  { word: 'Watch',   cls: 's-watch' },
  WARNING:  { word: 'Problem', cls: 's-problem' }
};
export const STATUS_CLASSES = ['s-none', 's-fine', 's-watch', 's-problem'];
export const LEVEL_OK = 'OK';
export function statusOf(level) { return STATUS[level] || STATUS.NONE; }

export const FORM_METRICS = [
  { id: 'hr', label: 'Heart rate (bpm)' }, { id: 'bp_sys', label: 'Systolic pressure (mmHg)' },
  { id: 'bp_dia', label: 'Diastolic pressure (mmHg)' }, { id: 'glucose', label: 'Glucose (mg/dL)' },
  { id: 'temp', label: 'Temperature (°C)' }, { id: 'sleep_h', label: 'Sleep (h)' },
  { id: 'mood', label: 'Mood (0 to 100)' }, { id: 'phq2', label: 'PHQ-2 score (0 to 6, private)' }
];
export const PROFILES = [
  { id: 'LEO', label: 'LEO (0 s)' }, { id: 'MOON', label: 'Moon (1.3 s)' }, { id: 'MARS', label: 'Mars (1200 s, shown compressed)' }
];
export const PHASES = [
  { id: 'P1', label: 'P1 Pre-flight' }, { id: 'P2', label: 'P2 Launch' }, { id: 'P3', label: 'P3 Early orbit' },
  { id: 'P4', label: 'P4 LEO' }, { id: 'P5a', label: 'P5a Moon' }, { id: 'P5b', label: 'P5b Mars transit' },
  { id: 'P5c', label: 'P5c Mars surface' }, { id: 'P6', label: 'P6 Landing' }, { id: 'P7', label: 'P7 Post-flight' }
];
export const LANDING_PHASE = 'P6';
export const GROUND_STATUS = {
  in_transit: 'On its way to Earth', delivered: 'Received on Earth', held_link_down: 'Held on board: link down'
};
export const EVENT_LABELS = { EVA: 'Spacewalk', LANDING: 'Landing' };
export const POSTURES = { supine: 'Lying down', sit: 'Sitting', stand: 'Standing' };
export const ALERT_LINES = { what: 'What', why: 'Why', doNow: 'Do now', evidence: 'Evidence', escalation: 'Escalation' };
export const BADGES = { private: 'PRIVATE', design: 'DESIGN', rose: 'LEVEL ROSE', conflict: 'CONFLICT' };
export const TEXT = {
  noData: 'No data',
  conflict: 'Conflict',
  linkUp: 'Link up',
  linkDown: 'Link down',
  simulated: 'Demo data SIMULATED',
  share: 'Share with CMO',
  why: 'Why this test',
  waking: 'Waking the server. This can take about a minute.',
  retry: 'Retry',
  restarted: 'The server restarted. Demo data was reset.',
  pickRegion: 'Pick a body region on the figure to see its readings and alerts.',
  noAlerts: 'No open alerts.',
  noRegionAlerts: 'No open alerts for this region.',
  noGround: 'Nothing has been sent to Earth yet.',
  noStand: 'No stand test yet. Use "Run stand test" in the demo controls.',
  sampleMissing: 'The sample file could not be loaded.',
  fileUnreadable: 'The file could not be read.'
};
export const FOOTER = 'Decision support and education prototype. Not a medical device.';
