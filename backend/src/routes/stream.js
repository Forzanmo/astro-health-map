// GET /api/v1/stream: Server-Sent Events. Pushes a small "live" frame every 100 ms and the whole State when it changes.
const { ApiError } = require('../errors');
const store = require('../sessions/store');
const { streamIntervalMs, maxStreams } = require('../config');

let openStreams = 0;
const write = (res, event, data) => res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n');

function streamRoute(req, res, next) {
  if (openStreams >= maxStreams) return next(new ApiError(503, 'BUSY', 'Too many live streams are open. Try again in a minute.'));
  openStreams += 1;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive', 'X-Accel-Buffering': 'no'
  });
  res.write('retry: 2000\n\n');

  let lastVersion = -1;
  const tick = () => {
    const engine = store.getOrCreate(req.sessionId);          // also keeps the session alive while it streams
    const frame = engine.getLiveFrame();
    if (frame.version !== lastVersion) { lastVersion = frame.version; write(res, 'state', engine.getState()); }
    write(res, 'live', frame);
  };
  tick();
  const timer = setInterval(tick, streamIntervalMs);
  req.on('close', () => { clearInterval(timer); openStreams -= 1; });
  return undefined;
}

module.exports = { streamRoute };
