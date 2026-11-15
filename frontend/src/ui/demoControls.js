// demoControls.js: the demo dock: profile, link, phase, day, time and the four demo buttons.
import { $ } from './dom.js';
import { PROFILES, PHASES, LANDING_PHASE } from '../constants.js';

let dock = null;

function options(list) {
  return list.map((o) => `<option value="${o.id}">${o.label}</option>`).join('');
}

function markup() {
  return `
    <span class="dock-title">Demo controls</span>
    <label class="field">Profile<select id="ctl-profile">${options(PROFILES)}</select></label>
    <label class="field">Phase<select id="ctl-phase">${options(PHASES)}</select></label>
    <label class="field">Mission day<input id="ctl-day" type="number" inputmode="numeric" class="narrow"></label>
    <label class="field">Time<input id="ctl-time" type="time"></label>
    <label class="field switch"><input id="ctl-link" type="checkbox">Link down</label>
    <div class="dock-actions">
      <button type="button" class="btn danger" data-act="storm">Trigger solar storm</button>
      <button type="button" class="btn" data-act="landing">Jump to landing (P6)</button>
      <button type="button" class="btn" data-act="stand">Run stand test</button>
      <button type="button" class="btn" data-act="reset">Reset demo</button>
    </div>`;
}

function onChange(event, actions) {
  const el = event.target;
  if (el.id === 'ctl-profile') actions.setContext({ profile: el.value });
  if (el.id === 'ctl-phase') actions.setContext({ phase: el.value });
  if (el.id === 'ctl-day' && el.value !== '') actions.setContext({ day: Number(el.value) });
  if (el.id === 'ctl-time' && el.value !== '') actions.setContext({ time: el.value });
  if (el.id === 'ctl-link') actions.setContext({ link_down: el.checked });
}

function onClick(event, actions) {
  const button = event.target.closest('[data-act]');
  if (!button) return;
  const act = button.dataset.act;
  if (act === 'storm') actions.triggerStorm();
  if (act === 'landing') actions.setContext({ phase: LANDING_PHASE });
  if (act === 'stand') actions.runStandTest();
  if (act === 'reset') actions.resetDemo();
}

function setValue(id, value) {
  const el = $(id, dock);
  if (document.activeElement !== el) el.value = value;
}

export function mount(root, actions) {
  dock = $('#demo-controls');
  dock.innerHTML = markup();
  dock.addEventListener('change', (event) => onChange(event, actions));
  dock.addEventListener('click', (event) => onClick(event, actions));
}

export function render(state) {
  const c = state.context;
  setValue('#ctl-profile', c.profile);
  setValue('#ctl-phase', c.phase);
  setValue('#ctl-day', c.day);
  setValue('#ctl-time', c.time);
  $('#ctl-link', dock).checked = c.link_down;
}
