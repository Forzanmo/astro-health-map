// The landing stand test: built-in rows and the evaluation (Appendix A.11, rule M4-a).
const { validation } = require('../errors');
const { mean } = require('./scenario');

// 5 min supine, 30 s sitting, 3 min standing, one row every 10 s. All SIMULATED.
function builtInRows() {
  const rows = [];
  const hrSupine = [60, 61, 59]; const sysSupine = [118, 119, 117]; const diaSupine = [76, 77, 75];
  for (let i = 0; i < 30; i += 1) rows.push({ t_s: i * 10, posture: 'supine', hr_bpm: hrSupine[i % 3], bp_sys: sysSupine[i % 3], bp_dia: diaSupine[i % 3], provenance: 'SIMULATED' });
  [64, 66, 68].forEach((hr, i) => rows.push({ t_s: 300 + i * 10, posture: 'sit', hr_bpm: hr, bp_sys: 116, bp_dia: 75, provenance: 'SIMULATED' }));
  const hrStand = [76, 82, 86, 88, 90, 91, 92, 92, 91, 92, 91, 90, 91, 92, 91, 90, 91, 90, 91];
  hrStand.forEach((hr, i) => rows.push({ t_s: 330 + i * 10, posture: 'stand', hr_bpm: hr, bp_sys: i % 2 ? 110 : 112, bp_dia: i % 2 ? 72 : 73, provenance: 'SIMULATED' }));
  return rows;
}

function evaluateStand(rows) {
  const num = (r, k) => Number(r[k]);
  const supine = rows.filter((r) => r.posture === 'supine');
  let stand = rows.filter((r) => r.posture === 'stand');
  if (!supine.length || !stand.length) throw validation('The file needs supine and stand rows.', 'rows');
  const start = num(stand[0], 't_s');
  stand = stand.filter((r) => num(r, 't_s') <= start + 180);                    // within 3 min of standing
  const ref = (k) => mean(supine.map((r) => num(r, k)));                       // supine mean: our choice (DESIGN)
  const result = {
    hr_rise: Math.round(Math.max(...stand.map((r) => num(r, 'hr_bpm'))) - ref('hr_bpm')),
    sys_drop: Math.round(ref('bp_sys') - Math.min(...stand.map((r) => num(r, 'bp_sys')))),
    dia_drop: Math.round(ref('bp_dia') - Math.min(...stand.map((r) => num(r, 'bp_dia'))))
  };
  result.fired = (result.hr_rise >= 30 || result.sys_drop >= 20 || result.dia_drop >= 10) ? 'M4-a' : null;   // Freeman 2011
  result.readiness = result.fired ? 'WARNING' : 'OK';
  result.provenance = rows[0].provenance || 'SIMULATED';
  return result;
}

const STAND_COLUMNS = ['t_s', 'posture', 'hr_bpm', 'bp_sys', 'bp_dia', 'provenance'];
const toCsv = (rows, cols) => cols.join(',') + '\n' + rows.map((r) => cols.map((c) => r[c]).join(',')).join('\n') + '\n';

module.exports = { builtInRows, evaluateStand, toCsv, STAND_COLUMNS };
