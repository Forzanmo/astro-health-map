// bodyFigure.js: colours the seven body regions by level and draws one chip per region.
import { $, esc, pill } from './dom.js';
import { statusOf, STATUS_CLASSES } from '../constants.js';
import { getSelectedRegion } from './selection.js';

let svg = null;
let chips = null;

function pickFrom(event, actions) {
  const target = event.target.closest('[data-region]');
  if (target) actions.selectRegion(target.dataset.region);
}

function paint(region, selected) {
  const status = statusOf(region.level);
  svg.querySelectorAll(`[data-region="${region.id}"]`).forEach((shape) => {
    shape.classList.remove(...STATUS_CLASSES);
    shape.classList.add(status.cls);
    shape.classList.toggle('sel', selected);
  });
}

function chip(region, selected) {
  const status = statusOf(region.level);
  return `<button type="button" class="region-chip rc-${esc(region.id)} ${status.cls}${selected ? ' sel' : ''}"
    data-region="${esc(region.id)}" aria-pressed="${selected}">${esc(region.label)}${pill(region.level)}</button>`;
}

export function mount(root, actions) {
  svg = $('#body-svg');
  chips = $('#region-chips');
  svg.addEventListener('click', (event) => pickFrom(event, actions));
  chips.addEventListener('click', (event) => pickFrom(event, actions));
}

export function render(state) {
  const selected = getSelectedRegion();
  state.regions.forEach((region) => paint(region, region.id === selected));
  chips.innerHTML = state.regions.map((region) => chip(region, region.id === selected)).join('');
}
