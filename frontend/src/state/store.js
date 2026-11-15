// store.js: holds the latest State and tells subscribers when it changes.
let current = null;
const subscribers = [];

export function getState() { return current; }
export function subscribe(fn) { subscribers.push(fn); }
export function setState(next) {
  const restarted = current && next.session_started_at !== current.session_started_at;
  if (current && !restarted && next.version === current.version) return;
  current = next;
  subscribers.forEach((fn) => fn(current, { restarted }));
}
