const Car = require('../models/Car');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { userDTO } = require('../utils/serializers');
const { BOOKING_STATUSES } = require('../config/constants');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NOT_CANCELLED = { status: { $ne: 'Cancelled' } };

// Last 12 calendar months ending with the current one, grouped by pickup month. Empty months are zero-filled.
async function monthlyStats() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const rows = await Booking.aggregate([
    { $match: { ...NOT_CANCELLED, pickupDate: { $gte: start } } },
    { $group: { _id: { y: { $year: '$pickupDate' }, m: { $month: '$pickupDate' } }, bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
  ]);
  const byKey = Object.fromEntries(rows.map((r) => [`${r._id.y}-${r._id.m}`, r]));
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const hit = byKey[`${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`];
    return { month: MONTHS[d.getUTCMonth()], year: d.getUTCFullYear(), bookings: hit?.bookings || 0, revenue: hit?.revenue || 0 };
  });
}

async function popularCars(limit = 8) {
  const rows = await Booking.aggregate([
    { $match: NOT_CANCELLED },
    { $group: { _id: '$car', bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $sort: { bookings: -1 } },
    { $limit: limit },
    { $lookup: { from: 'cars', localField: '_id', foreignField: '_id', as: 'car' } },
    { $unwind: '$car' },
  ]);
  return rows.map((r) => ({ carId: r.car.carNo, name: `${r.car.brand} ${r.car.name}`, bookings: r.bookings, revenue: r.revenue }));
}

// GET /api/admin/stats: everything the dashboard overview needs
exports.stats = asyncHandler(async (req, res) => {
  const [totalCars, totalCustomers, totalBookings, availableFlag, rentedIds, revenueRows, pending, monthly, popular] = await Promise.all([
    Car.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Booking.countDocuments(),
    Car.countDocuments({ available: true }),
    Booking.distinct('car', { status: 'Active' }),
    Booking.aggregate([{ $match: { status: { $in: ['Completed', 'Active', 'Approved'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Booking.countDocuments({ status: 'Pending' }),
    monthlyStats(),
    popularCars(),
  ]);
  const rentedCars = rentedIds.length;
  const availableCars = await Car.countDocuments({ available: true, _id: { $nin: rentedIds } });
  res.json({
    success: true,
    stats: {
      totalCars, totalCustomers, totalBookings, rentedCars, availableCars,
      switchedOff: totalCars - availableFlag, pendingBookings: pending,
      totalRevenue: revenueRows[0]?.total || 0, monthly, popularCars: popular,
    },
  });
});

// GET /api/admin/reports: booking, revenue, popular-car and monthly reports
exports.reports = asyncHandler(async (req, res) => {
  const [byStatus, byType, totals, monthly, popular] = await Promise.all([
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([{ $match: NOT_CANCELLED }, { $group: { _id: '$bookingType', count: { $sum: 1 } } }]),
    Booking.aggregate([{ $match: NOT_CANCELLED }, { $group: { _id: null, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } }]),
    monthlyStats(),
    popularCars(),
  ]);
  const t = totals[0] || { revenue: 0, bookings: 0 };
  res.json({
    success: true,
    reports: {
      statusCounts: Object.fromEntries(BOOKING_STATUSES.map((s) => [s, byStatus.find((r) => r._id === s)?.count || 0])),
      selfDrive: byType.find((r) => r._id === 'Self Drive')?.count || 0,
      withDriver: byType.find((r) => r._id === 'With Driver')?.count || 0,
      revenue: t.revenue,
      averageBookingValue: t.bookings ? Math.round(t.revenue / t.bookings) : 0,
      monthly,
      popularCars: popular,
    },
  });
});

// GET /api/admin/customers
exports.customers = asyncHandler(async (req, res) => {
  const [users, counts] = await Promise.all([
    User.find({ role: 'customer' }).sort('-createdDate'),
    Booking.aggregate([{ $group: { _id: '$customer', n: { $sum: 1 } } }]),
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json({ success: true, count: users.length, customers: users.map((u) => ({ ...userDTO(u), bookingCount: map[String(u._id)] || 0 })) });
});

// PATCH /api/admin/customers/:id/status { status: "Active" | "Inactive" }
exports.setCustomerStatus = asyncHandler(async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!u) throw new ApiError(404, 'Customer not found.');
  u.status = req.body.status;
  await u.save();
  res.json({ success: true, customer: userDTO(u) });
});
