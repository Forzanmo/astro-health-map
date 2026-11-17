// One engine per session id, dropped after an idle hour.
const { createEngine } = require('../engine');
const { sessionTtlMs, maxSessions } = require('../config');

const sessions = new Map();

function getOrCreate(id) {
  const now = Date.now();
  for (const [key, s] of sessions) if (now - s.lastSeen > sessionTtlMs) sessions.delete(key);
  let session = sessions.get(id);
  if (!session) {
    if (sessions.size >= maxSessions) sessions.delete(sessions.keys().next().value);
    session = { engine: createEngine({ clock: { nowMs: () => Date.now() } }), lastSeen: now };
    sessions.set(id, session);
  }
  session.lastSeen = now;
  return session.engine;
}

module.exports = { getOrCreate };
