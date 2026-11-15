// One error type for the whole backend. The engine throws it; the HTTP layer turns it into the envelope.
class ApiError extends Error {
  constructor(status, code, message, field = null) {
    super(message); this.status = status; this.code = code; this.field = field;
  }
}
const validation = (message, field = null) => new ApiError(400, 'VALIDATION', message, field);
const notFoundError = (message = 'Not found.') => new ApiError(404, 'NOT_FOUND', message);

module.exports = { ApiError, validation, notFoundError };
