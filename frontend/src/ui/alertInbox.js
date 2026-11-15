// alertInbox.js: lists the open alerts in the order the API sends them.
import { $ } from './dom.js';
import { TEXT } from '../constants.js';
import { renderAlertCard } from './alertCard.js';

let inbox = null;
let count = null;

export function mount(root, actions) {
  inbox = $('#alert-inbox');
  count = $('#alert-count');
  inbox.addEventListener('click', (event) => {
    const button = event.target.closest('[data-share]');
    if (button) actions.shareAlert(button.dataset.share);
  });
}

export function render(state) {
  count.textContent = state.alerts.length + ' open';
  inbox.innerHTML = state.alerts.length
    ? state.alerts.map(renderAlertCard).join('')
    : `<p class="muted">${TEXT.noAlerts}</p>`;
}
