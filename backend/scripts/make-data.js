// Writes the two sample files in data/ from the engine, so the files and the engine always match. Run: npm run make-data
const fs = require('fs');
const path = require('path');
const { createEngine } = require('../src/engine');
const { builtInRows, toCsv, STAND_COLUMNS } = require('../src/engine/standTest');
const { HEADER } = require('../src/engine/csv');
const { toMin, tsOf } = require('../src/engine/time');

const engine = createEngine({ clock: { nowMs: () => Date.now() } });
const base = engine._baseline();
const hr = Math.round(base.hr.mean + 2.5 * base.hr.sd);          // about 2.5 SD above baseline, twice: the import turns the card amber
const temp = Math.round(base.temp.mean * 10) / 10;
const sample = [
  HEADER,
  ['B', 'hr', hr, 'bpm', tsOf(toMin(142, '08:30')), 'chest_strap_sim', 'SIMULATED'].join(','),
  ['B', 'hr', hr, 'bpm', tsOf(toMin(142, '08:40')), 'chest_strap_sim', 'SIMULATED'].join(','),
  ['B', 'temp', temp, '°C', tsOf(toMin(142, '08:40')), 'patch_sim', 'SIMULATED'].join(',')
].join('\n') + '\n';

const dir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'sample_device_export.csv'), sample);
fs.writeFileSync(path.join(dir, 'stand_test_B_P6.csv'), toCsv(builtInRows(), STAND_COLUMNS));
console.log('Wrote data/sample_device_export.csv and data/stand_test_B_P6.csv');
