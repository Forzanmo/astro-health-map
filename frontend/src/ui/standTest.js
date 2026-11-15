// standTest.js: replays the stand test rows in about 5 seconds, then shows landing readiness.
import { $, esc, tag, pill } from './dom.js';
import { POSTURES, TEXT } from '../constants.js';

const REPLAY_MS = 5000;
let panel = null;
let timer = null;
let lastTag = '';
let summary = null;

function clock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = String(Math.round(seconds % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

function rowView(row, done) {
  return `<h2 class="label">Stand test replay</h2>
    <div class="stand-now">
      <span><b>${esc(POSTURES[row.posture] || row.posture)}</b> at ${clock(row.t_s)}</span>
      <span><span class="num">${esc(row.hr_bpm)}</span> <span class="unit">bpm</span></span>
      <span><span class="num">${esc(row.bp_sys)}/${esc(row.bp_dia)}</span> <span class="unit">mmHg</span></span>
      ${tag(row.provenance)}
    </div>
    <div class="stand-track"><i style="width:${(done * 100).toFixed(1)}%"></i></div>`;
}

function resultView(r) {
  const fired = r.fired ? `<p>Rule fired: ${esc(r.fired)}</p>` : '';
  return `<h2 class="label">Landing readiness</h2>
    <div class="stand-result">
      <p class="headline">${pill(r.readiness)} Stand test result</p>
      <p>Heart rate rise: <b>${esc(r.hr_rise)}</b> <span class="unit">bpm</span> ${lastTag}</p>
      <p>Blood pressure drop: <b>${esc(r.sys_drop)}/${esc(r.dia_drop)}</b> <span class="unit">mmHg</span> ${lastTag}</p>
      ${fired}
    </div>`;
}

function draw() {
  if (timer) return;
  panel.innerHTML = summary ? resultView(summary) : `<h2 class="label">Landing readiness</h2><p class="muted">${TEXT.noStand}</p>`;
}

export function play(result) {
  const rows = result.rows || [];
  clearInterval(timer);
  timer = null;
  summary = result;
  if (!rows.length) { draw(); return; }
  lastTag = tag(rows[0].provenance);
  let i = 0;
  timer = setInterval(() => {
    panel.innerHTML = rowView(rows[i], (i + 1) / rows.length);
    i += 1;
    if (i >= rows.length) { clearInterval(timer); timer = null; setTimeout(draw, 400); }
  }, REPLAY_MS / rows.length);
}

export function mount() {
  panel = $('#stand-test');
  draw();
}

export function render(state) {
  summary = state.stand_test;
  draw();
}
