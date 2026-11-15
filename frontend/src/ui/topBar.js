// topBar.js: draws the mission context: crew, phase, clock, events, profile, link and the demo data chip.
import { $, esc } from './dom.js';
import { statusOf, PROFILES, EVENT_LABELS, LEVEL_OK, TEXT } from '../constants.js';

let bar = null;
let strip = null;

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
  strip = $('#status-strip');
}

export function render(state) {
  const c = state.context;
  const profile = PROFILES.find((p) => p.id === c.profile);
  const link = c.link_down ? TEXT.linkDown : TEXT.linkUp;
  const events = c.events.filter((event) => !event.past).map(eventChip).join('');
  bar.innerHTML = `
    <div class="top-group">
      ${fact('Crew', c.crew_id)}
      ${fact('Phase', c.phase + ' ' + c.phase_label)}
      ${fact('Mission day', 'Day ' + c.day)}
      ${fact('Time', c.time)}
    </div>
    <div class="top-group">${events}</div>
    <div class="top-group end">
      ${fact('Profile and delay', profile ? profile.label : c.profile)}
      <span class="chip${c.link_down ? ' is-down' : ''}"><i class="dot"></i>${link}</span>
      <span class="chip sim">${TEXT.simulated}</span>
    </div>`;
  strip.innerHTML = `&gt; ${TEXT.stripReady} · Mission day ${esc(c.day)} · ${esc(c.time)} · ${link}<i class="cursor"></i>`;
}
