// Every fixed value of the contract data dictionary (contract 4.6). No logic.
const CREW = 'B';
const SEED = 20261115;
const DEMO_START = { day: 142, time: '11:30' };
const SCENARIOS = ['normal', 'watch', 'problem'];

const RANK = { NONE: 0, OK: 1, ADVISORY: 2, CAUTION: 3, WARNING: 4 };
const LEVEL_WEIGHT = { ADVISORY: 1, CAUTION: 3, WARNING: 9 };
const PROVENANCE = ['MEASURED', 'ESTIMATED', 'SIMULATED', 'LIVE'];

const PROFILES = {
  LEO: { delay_s: 0, shown_delay_s: 0 },
  MOON: { delay_s: 1.3, shown_delay_s: 1.3 },
  MARS: { delay_s: 1200, shown_delay_s: 6 }       // shown delay is a demo setting
};

// Gravity is context from the problem definition (Part B). No rule uses it.
const PHASES = {
  P1: { label: 'Pre-flight', in_flight: false, gravity: '1 g' },
  P2: { label: 'Launch', in_flight: false, gravity: 'about 3 to 4 g' },
  P3: { label: 'Early orbit', in_flight: false, gravity: 'weightless' },
  P4: { label: 'LEO', in_flight: true, gravity: 'weightless' },
  P5a: { label: 'Moon', in_flight: true, gravity: '1/6 g on the surface' },
  P5b: { label: 'Mars transit', in_flight: true, gravity: 'weightless' },
  P5c: { label: 'Mars surface', in_flight: true, gravity: '3/8 g' },
  P6: { label: 'Landing', in_flight: false, gravity: 'returning to gravity' },
  P7: { label: 'Post-flight', in_flight: false, gravity: '1 g' }
};

// Simulated devices. Names follow the project's device list; none is a real connection.
const DEVICES = {
  wearable: { name: 'Wearable band' },
  cuff: { name: 'Blood pressure cuff' },
  analyzer: { name: 'Fluid analyzer' },
  cabin: { name: 'Radiation and cabin sensor unit' },
  tablet: { name: 'Tablet check-in' }
};

const METRICS = {
  bp_sys: { label: 'Systolic pressure', unit: 'mmHg', decimals: 0, cabin: false, device: 'cuff', live: true },
  bp_dia: { label: 'Diastolic pressure', unit: 'mmHg', decimals: 0, cabin: false, device: 'cuff', live: true },
  hr: { label: 'Heart rate', unit: 'bpm', decimals: 0, cabin: false, device: 'wearable', live: true },
  glucose: { label: 'Glucose', unit: 'mg/dL', decimals: 0, cabin: false, device: 'analyzer', live: false },
  temp: { label: 'Temperature', unit: '°C', decimals: 1, cabin: false, device: 'wearable', live: true },
  sleep_h: { label: 'Sleep', unit: 'h', decimals: 1, cabin: false, device: 'wearable', live: false },
  mood: { label: 'Mood', unit: '/100', decimals: 0, cabin: false, device: 'tablet', live: false },
  phq2: { label: 'PHQ-2 score', unit: '/6', decimals: 0, cabin: false, device: 'tablet', live: false },
  ppco2: { label: 'Cabin CO2', unit: 'mmHg', decimals: 2, cabin: true, device: 'cabin', live: true },
  dose_msv: { label: 'Radiation dose', unit: 'mSv', decimals: 1, cabin: false, device: 'cabin', live: false },
  proton_pfu: { label: 'Proton flux', unit: 'pfu', decimals: 2, cabin: true, device: 'cabin', live: true }
};

const BASE_METRICS = ['bp_sys', 'bp_dia', 'hr', 'glucose', 'temp', 'sleep_h', 'mood'];
// SIMULATED pre-flight mean and SD, used only to generate the 28-day baseline.
const SIM_BASE = { bp_sys: [118, 5], bp_dia: [76, 4], hr: [62, 4], glucose: [90, 6], temp: [36.8, 0.2], sleep_h: [6.9, 1.0], mood: [72, 6] };

// One alert per crew member per ladder. The order also breaks priority ties.
const LADDERS = [
  { id: 'flux', region: 'radiation', metrics: ['proton_pfu'], affects: ['EVA'] },
  { id: 'dose', region: 'radiation', metrics: ['dose_msv'] },
  { id: 'sleep', region: 'mind', metrics: ['sleep_h'], affects: ['EVA', 'LANDING'] },
  { id: 'co2', region: 'lungs', metrics: ['ppco2'] },
  { id: 'stand', region: 'heart', metrics: ['hr', 'bp_sys', 'bp_dia'], affects: ['LANDING'] },
  { id: 'phq', region: 'mind', metrics: ['phq2'], isPrivate: true },
  { id: 'vital-bp_sys', region: 'heart', metrics: ['bp_sys'] },
  { id: 'vital-bp_dia', region: 'heart', metrics: ['bp_dia'] },
  { id: 'vital-hr', region: 'heart', metrics: ['hr'] },
  { id: 'vital-glucose', region: 'metabolism', metrics: ['glucose'] },
  { id: 'vital-temp', region: 'metabolism', metrics: ['temp'] },
  { id: 'vital-sleep_h', region: 'mind', metrics: ['sleep_h'] },
  { id: 'vital-mood', region: 'mind', metrics: ['mood'], isPrivate: true }
];

const REGIONS = [
  { id: 'head', label: 'Head and eyes', metrics: [], note: 'No data yet. In-flight eye checks use OCT and eye ultrasound.' },
  { id: 'heart', label: 'Heart and circulation', metrics: ['hr', 'bp_sys', 'bp_dia'], note: null },
  { id: 'lungs', label: 'Lungs and cabin air', metrics: ['ppco2'], note: null },
  { id: 'metabolism', label: 'Metabolism and temperature', metrics: ['glucose', 'temp'], note: null },
  { id: 'bones', label: 'Bones and muscles', metrics: [], note: 'No data yet. Exercise data would fill this region.' },
  { id: 'mind', label: 'Mind and sleep', metrics: ['sleep_h', 'mood', 'phq2'], note: null },
  { id: 'radiation', label: 'Whole body: radiation', metrics: ['dose_msv', 'proton_pfu'], note: null }
];

const CARDS = [
  { id: 'bp', label: 'Blood pressure', unit: 'mmHg', parts: ['bp_sys', 'bp_dia'], ladders: ['vital-bp_sys', 'vital-bp_dia', 'stand'] },
  { id: 'hr', label: 'Heart rate', unit: 'bpm', parts: ['hr'], ladders: ['vital-hr', 'stand'] },
  { id: 'glucose', label: 'Glucose', unit: 'mg/dL', parts: ['glucose'], ladders: ['vital-glucose'] },
  { id: 'temp', label: 'Temperature', unit: '°C', parts: ['temp'], ladders: ['vital-temp'] },
  { id: 'sleep_h', label: 'Sleep', unit: 'h', parts: ['sleep_h'], ladders: ['vital-sleep_h', 'sleep'] },
  { id: 'mood', label: 'Mood', unit: '/100', parts: ['mood'], ladders: ['vital-mood', 'phq'] }
];

module.exports = { CREW, SEED, DEMO_START, SCENARIOS, RANK, LEVEL_WEIGHT, PROVENANCE, PROFILES, PHASES, DEVICES, METRICS,
  BASE_METRICS, SIM_BASE, LADDERS, REGIONS, CARDS };
