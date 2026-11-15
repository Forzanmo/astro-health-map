// Reads the environment once.
const clientUrls = (process.env.CLIENT_URLS || 'http://localhost:5173')
  .split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);

module.exports = {
  port: Number(process.env.PORT) || 8080,
  clientUrls,
  sessionTtlMs: 60 * 60 * 1000,
  maxSessions: 200,
  streamIntervalMs: Math.max(50, Number(process.env.STREAM_INTERVAL_MS) || 100),
  maxStreams: 60
};
