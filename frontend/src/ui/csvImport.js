// csvImport.js: loads a device file (CSV) or the sample file, sends its text, shows "N added, M rejected".
import { $, esc } from './dom.js';
import { TEXT } from '../constants.js';

const SAMPLE_URL = 'data/sample_device_export.csv';
let box = null;

function markup() {
  return `
    <div class="csv-row">
      <input id="csv-file" type="file" accept=".csv,text/csv">
      <label for="csv-file" class="btn">Load device file (CSV)</label>
      <button type="button" class="btn" id="csv-sample">Load sample file</button>
    </div>
    <div id="csv-result" class="csv-result" role="status"></div>`;
}

function showResult(result) {
  const out = $('#csv-result', box);
  if (!result) { out.textContent = ''; return; }
  const errors = (result.errors || []).map((e) => `<li>Row ${esc(e.row)}: ${esc(e.message)}</li>`).join('');
  out.innerHTML = `${esc(result.added)} added, ${esc(result.rejected)} rejected${errors ? `<ul>${errors}</ul>` : ''}`;
}

async function send(readText, failText, actions) {
  let csv = null;
  try { csv = await readText(); } catch (e) { csv = null; }
  if (csv === null) { $('#csv-result', box).textContent = failText; return; }
  showResult(await actions.importCsv(csv));
}

async function fetchSample() {
  const response = await fetch(SAMPLE_URL);
  if (!response.ok) throw new Error('missing');
  return response.text();
}

export function mount(root, actions) {
  box = $('#csv-import');
  box.innerHTML = markup();
  $('#csv-file', box).addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) send(() => file.text(), TEXT.fileUnreadable, actions);
    event.target.value = '';
  });
  $('#csv-sample', box).addEventListener('click', () => send(fetchSample, TEXT.sampleMissing, actions));
}

export function render() {}
