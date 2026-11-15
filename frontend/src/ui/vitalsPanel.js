// vitalsPanel.js: draws the six vital cards from state.vitals.
import { $, esc, tag, pill, showValue } from './dom.js';
import { statusOf, TEXT } from '../constants.js';
import { renderSparkline } from './sparkline.js';

let panel = null;

function pair(a, b) {
  return b === null || b === undefined ? showValue(a) : `${showValue(a)}/${showValue(b)}`;
}

function baseline(card) {
  if (card.base_mean === null) return TEXT.noData;
  return `mean ${pair(card.base_mean, card.base_mean2)}, SD ${pair(card.base_sd, card.base_sd2)}`;
}

function card(v) {
  const status = statusOf(v.level);
  return `
    <article class="vital ${status.cls}">
      <header><h3>${esc(v.label)}</h3>${pill(v.level)}</header>
      <p class="vital-value">
        <span class="num">${pair(v.value, v.value2)}</span>
        <span class="unit">${esc(v.unit)}</span>
        ${tag(v.provenance)}
      </p>
      <p class="vital-base">Baseline ${baseline(v)}</p>
      <div class="vital-foot">
        <button type="button" class="link-btn" data-why="${esc(v.id)}">${TEXT.why}</button>
        ${renderSparkline(v.trend7d, v.base_mean, v.base_sd)}
      </div>
    </article>`;
}

export function mount(root, actions) {
  panel = $('#vitals-panel');
  panel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-why]');
    if (button) actions.openWhy(button.dataset.why);
  });
}

export function render(state) {
  panel.innerHTML = state.vitals.map(card).join('');
}
