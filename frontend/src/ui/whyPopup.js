// whyPopup.js: the "why this test" pop-up. Always exactly five lines.
import { $, esc } from './dom.js';
import { TEXT } from '../constants.js';
import { WHY } from '../content/why.js';

let dialog = null;

export function mount() {
  dialog = $('#why-popup');
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.closest('[data-close]')) dialog.close();
  });
}

export function open(id) {
  const item = WHY[id];
  if (!item) return;
  dialog.innerHTML = `
    <h2 id="why-title">${TEXT.why}: ${esc(item.title)}</h2>
    <ol>${item.lines.map((line) => `<li>${esc(line)}</li>`).join('')}</ol>
    <button type="button" class="btn" data-close>Close</button>`;
  dialog.showModal();
}

export function render() {}
