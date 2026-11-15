// themeToggle.js: switches between the dark and the light theme and remembers the choice.
import { $ } from './dom.js';
import { TEXT } from '../constants.js';

const KEY = 'vitalorbit_theme';
const LIGHT = 'light';
let button = null;

function readSaved() {
  try { return localStorage.getItem(KEY); } catch (e) { return null; }
}

function save(value) {
  try { localStorage.setItem(KEY, value); } catch (e) { /* storage is optional */ }
}

function apply(isLight) {
  document.documentElement.classList.toggle(LIGHT, isLight);
  button.textContent = isLight ? TEXT.themeDark : TEXT.themeLight;
}

export function mount() {
  button = $('#theme-toggle');
  apply(readSaved() === LIGHT);
  button.addEventListener('click', () => {
    const isLight = !document.documentElement.classList.contains(LIGHT);
    apply(isLight);
    save(isLight ? LIGHT : 'dark');
  });
}

export function render() {}
