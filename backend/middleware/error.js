const ApiError = require('../utils/ApiError');

exports.notFound = (req, res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// Centralised error handler: every failure leaves the API as { success:false, message, details? }.
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';
  let details = err.details;

  if (err.name === 'ValidationError') {            // Mongoose schema validation
    status = 400;
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    message = Object.values(details)[0];
  } else if (err.name === 'CastError') {           // malformed ObjectId etc.
    status = 400;
    message = `Invalid ${err.path}.`;
  } else if (err.code === 11000) {                 // duplicate key
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    message = field === 'email' ? 'An account with this email already exists.' : `This ${field} already exists.`;
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 5 MB).' : err.message;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON in request body.';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error.' : message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV !== 'production' && status >= 500 ? { stack: err.stack } : {}),
  });
};
