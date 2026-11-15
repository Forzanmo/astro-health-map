// topBar.js: draws the mission context: crew, phase, clock, events, profile, link and the demo data chip.
import { $, esc } from './dom.js';
import { statusOf, PROFILES, EVENT_LABELS, LEVEL_OK, TEXT } from '../constants.js';

let bar = null;

function fact(label, value) {
  return `<div class="top-fact"><small>${label}</small><b>${esc(value)}</b></div>`;
}

function eventChip(event) {
  const status = statusOf(event.level);
  const name = EVENT_LABELS[event.type] || event.type;
  const conflict = event.level !== LEVEL_OK ? ` <b>${TEXT.conflict}: ${status.word}</b>` : ` <b>${status.word}</b>`;
  return `<span class="chip event ${status.cls}">${esc(name)} day ${esc(event.day)} at ${esc(event.time)}, crew ${esc(event.crew.join(' and '))}${conflict}</span>`;
}

export function mount() {
  bar = $('#top-bar');
}

export function render(state) {
  const c = state.context;
  const profile = PROFILES.find((p) => p.id === c.profile);
  const events = c.events.filter((event) => !event.past).map(eventChip).join('');
  bar.innerHTML = `
    <h1 class="brand">Vital<span>Orbit</span></h1>
    <div class="top-group">
      ${fact('Crew', c.crew_id)}
      ${fact('Phase', c.phase + ' ' + c.phase_label)}
      ${fact('Mission day', 'Day ' + c.day)}
      ${fact('Time', c.time)}
    </div>
    <div class="top-group">${events}</div>
    <div class="top-group end">
      ${fact('Profile and delay', profile ? profile.label : c.profile)}
      <span class="chip">${c.link_down ? TEXT.linkDown : TEXT.linkUp}</span>
      <span class="chip sim">${TEXT.simulated}</span>
    </div>`;
}
