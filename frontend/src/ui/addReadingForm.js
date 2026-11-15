// addReadingForm.js: the "Add reading" form. Shows the API's error message under the form.
import { $ } from './dom.js';
import { FORM_METRICS } from '../constants.js';

let box = null;

function markup() {
  const options = FORM_METRICS.map((m) => `<option value="${m.id}">${m.label}</option>`).join('');
  return `
    <form id="add-reading-form" class="add-form" novalidate>
      <label class="field">Metric<select id="reading-metric">${options}</select></label>
      <label class="field">Value<input id="reading-value" type="text" inputmode="decimal" autocomplete="off"></label>
      <button type="submit" class="btn primary">Add reading</button>
    </form>
    <p id="add-reading-error" class="form-error" role="alert"></p>`;
}

// Sends a number when the text is one. Otherwise sends the text, so the API can explain what is wrong.
function readValue(raw) {
  const text = raw.trim();
  const number = Number(text);
  return text !== '' && Number.isFinite(number) ? number : text;
}

async function submit(event, actions) {
  event.preventDefault();
  const input = $('#reading-value', box);
  const error = $('#add-reading-error', box);
  error.textContent = '';
  const reading = { metric: $('#reading-metric', box).value, value: readValue(input.value) };
  const result = await actions.addObservation(reading, (message) => { error.textContent = message; });
  if (result) input.value = '';
}

export function mount(root, actions) {
  box = $('#add-reading');
  box.innerHTML = markup();
  box.addEventListener('submit', (event) => submit(event, actions));
}

export function render() {}
