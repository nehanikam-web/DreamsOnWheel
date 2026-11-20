const Coupon = require('../models/Coupon');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { couponDTO } = require('../utils/serializers');
const { checkCoupon } = require('../utils/pricing');

const FIELDS = ['code', 'type', 'value', 'max', 'minDays', 'firstBookingOnly', 'label', 'active', 'expiresAt'];
const pick = (b) => Object.fromEntries(FIELDS.filter((k) => b[k] !== undefined).map((k) => [k, b[k]]));

// GET /api/coupons  (public): active, unexpired coupons for the offers page
exports.listActive = asyncHandler(async (req, res) => {
  const now = new Date();
  const list = await Coupon.find({ active: true, $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }] }).sort('code');
  res.json({ success: true, coupons: list.map(couponDTO) });
});

// POST /api/coupons/validate { code, days }
exports.validate = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: String(req.body.code || '').trim().toUpperCase() });
  const prior = req.user ? await Booking.countDocuments({ customer: req.user._id, status: { $ne: 'Cancelled' } }) : 0;
  const check = checkCoupon(coupon, { days: Number(req.body.days) || 1, priorBookings: prior });
  if (!check.ok) return res.status(400).json({ success: false, message: check.message });
  res.json({ success: true, coupon: couponDTO(coupon) });
});

// ---- admin
exports.listAll = asyncHandler(async (req, res) => {
  res.json({ success: true, coupons: (await Coupon.find().sort('code')).map(couponDTO) });
});
exports.create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, coupon: couponDTO(await Coupon.create(pick(req.body))) });
});
exports.update = asyncHandler(async (req, res) => {
  const c = await Coupon.findById(req.params.id);
  if (!c) throw new ApiError(404, 'Coupon not found.');
  Object.assign(c, pick(req.body));
  await c.save();
  res.json({ success: true, coupon: couponDTO(c) });
});
exports.remove = asyncHandler(async (req, res) => {
  const c = await Coupon.findByIdAndDelete(req.params.id);
  if (!c) throw new ApiError(404, 'Coupon not found.');
  res.json({ success: true, message: 'Coupon deleted.' });
});
