// groundView.js: shows what the flight surgeon on Earth has or will get, and the delay.
import { $, esc, pill } from './dom.js';
import { GROUND_STATUS, TEXT } from '../constants.js';

let view = null;

function delayLine(c) {
  const shown = c.shown_delay_s !== c.delay_s ? ` This demo waits ${esc(c.shown_delay_s)} s.` : '';
  return `<p class="ground-delay">One-way delay to Earth: ${esc(c.delay_s)} s.${shown}</p>`;
}

function item(g) {
  return `<li class="ground-item">
    ${pill(g.level)}<span>${esc(g.what)}</span>
    <span class="meta">Data as of ${esc(g.data_as_of)}. <b>${esc(GROUND_STATUS[g.status] || g.status)}</b></span>
  </li>`;
}

export function mount() {
  view = $('#ground-view');
}

export function render(state) {
  const list = state.ground.length
    ? `<ul>${state.ground.map(item).join('')}</ul>`
    : `<p class="muted">${TEXT.noGround}</p>`;
  view.innerHTML = delayLine(state.context) + list;
}
