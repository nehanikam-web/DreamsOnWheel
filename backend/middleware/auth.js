const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/token');
const User = require('../models/User');

function readToken(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

// Requires a valid JWT. Loads the user fresh from the database on every request,
// so deactivated accounts and role changes take effect immediately.
exports.protect = asyncHandler(async (req, res, next) => {
  const token = readToken(req);
  if (!token) throw new ApiError(401, 'Please log in to continue.');
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, err.name === 'TokenExpiredError' ? 'Your session has expired. Please log in again.' : 'Invalid token.');
  }
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'This account no longer exists.');
  if (user.status !== 'Active') throw new ApiError(403, 'This account is inactive. Please contact support.');
  req.user = user;
  next();
});

// Like protect, but anonymous requests are allowed through.
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  const token = readToken(req);
  if (!token) return next();
  try {
    const user = await User.findById(verifyToken(token).id);
    if (user && user.status === 'Active') req.user = user;
  } catch {
    /* ignore invalid tokens on public routes */
  }
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.'));
  }
  next();
};
