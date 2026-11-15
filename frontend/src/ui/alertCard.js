// alertCard.js: builds one alert card: badges, then What, Why, Do now, Evidence, Escalation in that order.
import { esc, tag, pill } from './dom.js';
import { statusOf, ALERT_LINES, BADGES, EVENT_LABELS, TEXT } from '../constants.js';

function badges(a) {
  const list = [];
  if (a.private) list.push(`<span class="badge b-private">${BADGES.private}</span>`);
  if (a.design) list.push(`<span class="badge">${BADGES.design}</span>`);
  if (a.refired) list.push(`<span class="badge b-rose">${BADGES.rose}</span>`);
  if (a.conflict) {
    const name = EVENT_LABELS[a.conflict.type] || a.conflict.type;
    list.push(`<span class="badge b-conflict">${BADGES.conflict}: ${esc(name)} ${esc(a.conflict.time)}</span>`);
  }
  return list.join('');
}

function evidence(a) {
  const cls = a.evidence_class ? ` <span class="badge">${esc(a.evidence_class)}</span>` : '';
  const design = a.design ? ` <span class="badge">${BADGES.design}</span>` : '';
  return `${esc(a.source)}${cls}${design}`;
}

export function renderAlertCard(a) {
  const status = statusOf(a.level);
  const note = a.note ? ` ${esc(a.note)}` : '';
  const share = a.private && !a.shared
    ? `<button type="button" class="btn" data-share="${esc(a.id)}">${TEXT.share}</button>` : '';
  return `
    <article class="alert-card ${status.cls}">
      <div class="alert-top">${pill(a.level)}${badges(a)}<span class="rule">${esc(a.rule_id)}</span></div>
      <dl class="alert-lines">
        <dt>${ALERT_LINES.what}</dt><dd class="what">${esc(a.what)}</dd>
        <dt>${ALERT_LINES.why}</dt><dd>${esc(a.why)}${note} ${tag(a.provenance)}</dd>
        <dt>${ALERT_LINES.doNow}</dt><dd><ol>${a.do_now.map((step) => `<li>${esc(step)}</li>`).join('')}</ol></dd>
        <dt>${ALERT_LINES.evidence}</dt><dd>${evidence(a)}</dd>
        <dt>${ALERT_LINES.escalation}</dt>
        <dd><span class="esc-text">${esc(a.escalation_text)}</span>. ${esc(a.escalation_reason)} <span class="who">${esc(a.who)}</span></dd>
      </dl>
      ${share}
    </article>`;
}
