// The rule register as data. Thresholds are copied from CLAUDE.md step 1c and live only here and in findings.js.
// evidence_class is null where CLAUDE.md gives only DESIGN.
const RULES = {
  'M1-a': { module: 'M1', level: 'CAUTION', source: 'NASA OCHMO-TB-020', evidence_class: 'STANDARD', design: false, fires_when: 'Projected end-of-mission dose above 600 mSv. Not active: the projection method is not in our sources.' },
  'M1-b': { module: 'M1', level: 'ADVISORY', source: 'NOAA SWPC scales', evidence_class: 'STANDARD', design: false, fires_when: 'Latest proton flux at or above 10 pfu (NOAA S1).' },
  'M1-c': { module: 'M1', level: 'WARNING', source: 'NOAA SWPC scales', evidence_class: 'STANDARD', design: false, fires_when: 'Latest proton flux at or above 1000 pfu (NOAA S3).' },
  'M2-a': { module: 'M2', level: 'CAUTION', source: 'Barger 2014 reference values', evidence_class: null, design: true, fires_when: '3 or more nights in a row under 6 h.' },
  'M3-a': { module: 'M3', level: 'WARNING', source: 'NASA-STD-3001 V2 6004', evidence_class: 'STANDARD', design: false, fires_when: 'Rolling 1-hour mean ppCO2 above 3 mmHg.' },
  'M3-b': { module: 'M3', level: 'CAUTION', source: 'Law 2014 (ISS)', evidence_class: 'SPACEFLIGHT', design: false, fires_when: 'Rolling 7-day mean ppCO2 above 2.5 mmHg.' },
  'M4-a': { module: 'M4', level: 'WARNING', source: 'Freeman 2011 consensus', evidence_class: 'GEN POP', design: false, fires_when: 'Heart rate rise of 30 bpm or more, or blood pressure drop of 20/10 mmHg or more, within 3 min of standing.' },
  'M5-b': { module: 'M5', level: 'CAUTION', source: 'Kroenke 2003', evidence_class: 'GEN POP', design: false, fires_when: 'PHQ-2 of 3 or more. Offers PHQ-9, private.' },
  'V-1': { module: 'V', level: 'CAUTION', source: 'own baseline', evidence_class: null, design: true, fires_when: 'A vital 2 SD or more from own baseline on 2 readings in a row.' },
  'V-2': { module: 'V', level: 'WARNING', source: 'own baseline', evidence_class: null, design: true, fires_when: 'A vital 3 SD or more from own baseline.' },
  'V-3': { module: 'V', level: 'ADVISORY', source: 'Stahn 2017; Fu 2019', evidence_class: null, design: true, fires_when: 'In flight only: temperature up, or blood pressure down, in the documented in-flight direction. Replaces V-1.' }
};

// Rules of each ladder, lowest to highest (contract 4.6).
const LADDER_RULES = {
  flux: ['M1-b', 'M1-c'], dose: ['M1-a'], sleep: ['M2-a'], co2: ['M3-b', 'M3-a'], stand: ['M4-a'], phq: ['M5-b'],
  'vital-bp_sys': ['V-3', 'V-1', 'V-2'], 'vital-bp_dia': ['V-3', 'V-1', 'V-2'], 'vital-hr': ['V-1', 'V-2'],
  'vital-glucose': ['V-1', 'V-2'], 'vital-temp': ['V-3', 'V-1', 'V-2'], 'vital-sleep_h': ['V-1', 'V-2'], 'vital-mood': ['V-1', 'V-2']
};

// TODO-SOURCE: phase weights come from the system blueprint, section 4. Shape: { P5b: { M1: 1.5 } }. Missing means 1.0.
const PHASE_WEIGHTS = {};

module.exports = { RULES, LADDER_RULES, PHASE_WEIGHTS };
