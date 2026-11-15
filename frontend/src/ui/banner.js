// banner.js: one strip under the top bar for waking, network errors with Retry, and notices.
import { $, esc } from './dom.js';
import { TEXT } from '../constants.js';

const WAKING_DELAY_MS = 2000;
const NOTICE_MS = 8000;
let strip = null;
let wakingTimer = null;
let noticeTimer = null;
let kind = null;

function show(nextKind, html, isError = false) {
  if (!strip) strip = $('#banner');
  kind = nextKind;
  strip.innerHTML = html;
  strip.classList.toggle('is-error', isError);
  strip.hidden = false;
}

function hide() {
  if (!strip) return;
  kind = null;
  strip.hidden = true;
  strip.innerHTML = '';
}

export function showWaking() {
  clearTimeout(wakingTimer);
  wakingTimer = setTimeout(() => show('waking', `<span>${TEXT.waking}</span>`), WAKING_DELAY_MS);
}

export function showError(message, retry) {
  clearTimeout(wakingTimer);
  show('error', `<span>${esc(message)}</span><button type="button" class="btn">${TEXT.retry}</button>`, true);
  $('button', strip).addEventListener('click', () => { hide(); retry(); });
}

export function showNotice(text) {
  clearTimeout(noticeTimer);
  show('notice', `<span>${esc(text)}</span>`);
  noticeTimer = setTimeout(() => { if (kind === 'notice') hide(); }, NOTICE_MS);
}

// Clears waking and error messages. A notice stays until its own timer ends.
export function clear() {
  clearTimeout(wakingTimer);
  if (kind !== 'notice') hide();
}
