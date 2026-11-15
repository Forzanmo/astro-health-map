// regionPanel.js: shows the selected region: its readings, its alerts, its "why this test" links and its note.
import { $, esc, tag, pill, showValue } from './dom.js';
import { TEXT } from '../constants.js';
import { getSelectedRegion } from './selection.js';
import { REGION_CONTENT } from '../content/regions.js';
import { WHY } from '../content/why.js';

let panel = null;

function readingRow(r) {
  const unit = r.value === null ? '' : ` <span class="unit">${esc(r.unit)}</span> ${tag(r.provenance)}`;
  return `<tr><td>${esc(r.label)}</td><td><b>${showValue(r.value)}</b>${unit}</td><td>${esc(r.at ?? '')}</td></tr>`;
}

function alertRow(a) {
  return `<li class="mini-alert">${pill(a.level)}<span>${esc(a.what)}</span><span class="esc">${esc(a.escalation_text)}</span></li>`;
}

function whyLink(id) {
  return `<button type="button" class="link-btn" data-why="${esc(id)}">${TEXT.why}: ${esc(WHY[id].title)}</button>`;
}

function body(region, alerts) {
  const content = REGION_CONTENT[region.id] || { why: [], note: '' };
  const readings = region.readings.length
    ? `<h3>Readings</h3><table class="readings"><tbody>${region.readings.map(readingRow).join('')}</tbody></table>` : '';
  const alertList = alerts.length
    ? `<ul>${alerts.map(alertRow).join('')}</ul>` : `<p class="muted">${TEXT.noRegionAlerts}</p>`;
  const why = content.why.length ? `<h3>${TEXT.why}</h3><div class="why-links">${content.why.map(whyLink).join('')}</div>` : '';
  const note = content.note ? `<p class="region-note">${esc(content.note)}</p>` : '';
  return `<div class="region-head"><h2>${esc(region.label)}</h2>${pill(region.level)}</div>
    ${note}${readings}<h3>Alerts</h3>${alertList}${why}`;
}

export function mount(root, actions) {
  panel = $('#region-panel');
  panel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-why]');
    if (button) actions.openWhy(button.dataset.why);
  });
}

export function render(state) {
  const region = state.regions.find((r) => r.id === getSelectedRegion());
  if (!region) { panel.innerHTML = `<p class="muted">${TEXT.pickRegion}</p>`; return; }
  const alerts = state.alerts.filter((a) => region.alert_ids.includes(a.id));
  panel.innerHTML = body(region, alerts);
}
