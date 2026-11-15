// dom.js: small DOM helpers shared by the ui modules.
import { statusOf, TEXT } from '../constants.js';

const SHAPES = {
  's-fine': '<circle cx="5" cy="5" r="4.5"/>',
  's-watch': '<path d="M5 .5 9.8 9.5H.2Z"/>',
  's-problem': '<path d="M5 0 10 5 5 10 0 5Z"/>',
  's-none': '<path fill-rule="evenodd" d="M5 .5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/>'
};

export function $(selector, root = document) { return root.querySelector(selector); }

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function tag(provenance) {
  return provenance ? `<span class="tag">${esc(provenance)}</span>` : '';
}

export function pill(level, extra = '') {
  const status = statusOf(level);
  const more = extra ? ' ' + esc(extra) : '';
  return `<span class="pill ${status.cls}"><svg viewBox="0 0 10 10" aria-hidden="true">${SHAPES[status.cls]}</svg>${status.word}${more}</span>`;
}

export function showValue(value) {
  return value === null || value === undefined ? TEXT.noData : esc(value);
}
