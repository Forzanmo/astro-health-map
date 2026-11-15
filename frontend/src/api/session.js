// session.js: one session id per browser tab.
const KEY = 'vitalorbit_session_id';
let memory = null;

function newId() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'vo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

export function getSessionId() {
  if (memory) return memory;
  try { memory = sessionStorage.getItem(KEY); } catch (e) { memory = null; }
  if (!memory) {
    memory = newId();
    try { sessionStorage.setItem(KEY, memory); } catch (e) { /* storage is optional */ }
  }
  return memory;
}
