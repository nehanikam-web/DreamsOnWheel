const User = require('../models/User');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');
const { userDTO } = require('../utils/serializers');

const send = (res, status, user) => res.status(status).json({ success: true, token: signToken(user), user: userDTO(user) });

// POST /api/auth/register  (public). The role is always "customer": any role in the body is ignored.
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'An account with this email already exists.');
  const user = await User.create({ name, email, phone, password, role: 'customer' });
  await Notification.create({ user: user._id, text: 'Welcome to DreamsOnWheel. Use WELCOME10 for 10% off your first booking.' });
  send(res, 201, user);
});

async function authenticate(email, password, role) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  // Same message for "no such user", "wrong password" and "wrong portal" so accounts cannot be probed.
  const bad = new ApiError(401, role === 'admin' ? 'Invalid admin credentials.' : 'Incorrect email or password.');
  if (!user || user.role !== role || !(await user.matchPassword(password))) throw bad;
  if (user.status !== 'Active') throw new ApiError(403, 'This account is inactive. Please contact support.');
  return user;
}

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  send(res, 200, await authenticate(req.body.email, req.body.password, 'customer'));
});

// POST /api/auth/admin/login
exports.adminLogin = asyncHandler(async (req, res) => {
  send(res, 200, await authenticate(req.body.email, req.body.password, 'admin'));
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: userDTO(req.user) });
});

// PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const u = req.user;
  const { name, phone, city, licence, email } = req.body;
  if (name !== undefined) u.name = name;
  if (phone !== undefined) u.phone = phone;
  if (city !== undefined) u.address.city = city;
  if (licence !== undefined) u.licence = licence;
  if (email !== undefined && u.role === 'admin') u.email = email; // customers cannot change their login email
  await u.save();
  res.json({ success: true, user: userDTO(u) });
});

// PUT /api/auth/password
exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) throw new ApiError(400, 'Current password is incorrect.');
  if (req.body.currentPassword === req.body.newPassword) throw new ApiError(400, 'New password must be different from the current one.');
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated.' });
});

// POST /api/auth/logout  (JWTs are stateless: the client discards its token)
exports.logout = (req, res) => res.json({ success: true, message: 'Logged out.' });
