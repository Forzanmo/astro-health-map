// Every /api/v1 call needs a valid session id: the X-Session-Id header, or ?session= for the live stream.
const { ApiError } = require('../errors');
const store = require('../sessions/store');

const SESSION_ID = /^[A-Za-z0-9-]{8,64}$/;

function sessionMiddleware(req, res, next) {
  const id = req.get('X-Session-Id') || (typeof req.query.session === 'string' ? req.query.session : null);
  if (!id || !SESSION_ID.test(id)) {
    return next(new ApiError(400, 'SESSION_REQUIRED', 'Session id is missing or malformed.'));
  }
  req.sessionId = id;
  req.engine = store.getOrCreate(id);
  return next();
}

module.exports = { sessionMiddleware };
