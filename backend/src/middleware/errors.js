// notFound and errorHandler: every failure leaves the server in the contract's envelope.
const { ApiError, validation, notFoundError } = require('../errors');

function notFound(req, res, next) { next(notFoundError()); }

function errorHandler(err, req, res, next) {   // eslint-disable-line no-unused-vars
  let e = err;
  if (e.type === 'entity.parse.failed') e = validation('The body is not valid JSON.');
  if (e.type === 'entity.too.large') e = validation('The body is too large.');
  if (!(e instanceof ApiError)) {
    console.error(e);
    e = new ApiError(500, 'INTERNAL', 'Something went wrong on the server.');
  }
  res.status(e.status).json({ ok: false, error: { code: e.code, message: e.message, field: e.field } });
}

module.exports = { notFound, errorHandler };
