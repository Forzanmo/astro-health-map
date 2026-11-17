// Parses a device file in the observation format (Appendix A.12). Bad lines are skipped and reported.
const { validation } = require('../errors');
const { METRICS } = require('./constants');

const HEADER = 'crew_id,metric,value,unit,ts_utc,device,provenance';

function parseDeviceCsv(text, crew) {
  if (typeof text !== 'string') throw validation('The file must start with the header line of the device format.', 'csv');
  const lines = text.replace(/\r/g, '').split('\n');
  if ((lines[0] || '').trim() !== HEADER) throw validation('The file must start with the header line of the device format.', 'csv');
  const cols = HEADER.split(',');
  const readings = []; const errors = [];
  lines.forEach((line, index) => {
    if (index === 0 || line.trim() === '') return;
    const cells = line.split(',').map((c) => c.trim());
    const row = {}; cols.forEach((c, i) => { row[c] = cells[i] === undefined ? '' : cells[i]; });
    const cabin = METRICS[row.metric] && METRICS[row.metric].cabin;
    if (row.crew_id && row.crew_id !== crew && row.crew_id !== 'CABIN' && !cabin) { errors.push({ row: index + 1, message: 'Reading is for another crew member.' }); return; }
    readings.push({ row: index + 1, input: { metric: row.metric, value: row.value === '' ? NaN : Number(row.value), ts_utc: row.ts_utc || null, device: row.device || 'csv', provenance: row.provenance || undefined } });
  });
  return { readings, errors };
}

module.exports = { parseDeviceCsv, HEADER };
