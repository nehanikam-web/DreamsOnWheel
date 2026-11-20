const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Driver = require('../models/Driver');
const Coupon = require('../models/Coupon');
const Counter = require('../models/Counter');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { bookingDTO } = require('../utils/serializers');
const { parseDay, todayUTC } = require('../utils/dates');
const { calcPrice, checkCoupon } = require('../utils/pricing');
const { BLOCKING_STATUSES, STATUS_FLOW } = require('../config/constants');

const populate = (q) => q.populate('car', 'carNo name brand').populate('driver', 'name phone');
const notify = (user, text) => Notification.create({ user, text }).catch(() => {});

// Inclusive date-range overlap: existing.pickup <= new.return AND existing.return >= new.pickup
const overlap = (from, to) => ({ pickupDate: { $lte: to }, returnDate: { $gte: from } });

async function carIsFree(carId, from, to, excludeId) {
  const q = { car: carId, status: { $in: BLOCKING_STATUSES }, ...overlap(from, to) };
  if (excludeId) q._id = { $ne: excludeId };
  return !(await Booking.exists(q));
}

async function driverIsFree(driverId, from, to, excludeId) {
  const q = { driver: driverId, status: { $in: BLOCKING_STATUSES }, ...overlap(from, to) };
  if (excludeId) q._id = { $ne: excludeId };
  return !(await Booking.exists(q));
}

// Drivers on duty with no overlapping booking, most experienced first.
async function findFreeDriver(from, to) {
  const busy = await Booking.distinct('driver', { driver: { $ne: null }, status: { $in: BLOCKING_STATUSES }, ...overlap(from, to) });
  return Driver.findOne({ available: true, _id: { $nin: busy } }).sort('-experience');
}

// Shared by quote + create so both always agree.
async function buildQuote(body, user) {
  const car = await Car.findOne({ carNo: Number(body.carId) });
  if (!car) throw new ApiError(404, 'Car not found.');
  const mode = body.mode === 'driver' ? 'With Driver' : 'Self Drive';
  const from = parseDay(body.pickupDate);
  const to = parseDay(body.returnDate);
  if (!from || !to) throw new ApiError(400, 'Pickup and return dates must be valid (YYYY-MM-DD).');
  if (from < todayUTC()) throw new ApiError(400, 'Pickup date cannot be in the past.');
  if (to < from) throw new ApiError(400, 'Return date must be on or after the pickup date.');
  if (+from === +to && (body.returnTime || '10:00') <= (body.pickupTime || '10:00')) {
    throw new ApiError(400, 'Return time must be later than pickup time on a same-day rental.');
  }
  const settings = await Settings.get();
  let coupon = null;
  if (body.couponCode || body.coupon) {
    const code = String(body.couponCode || body.coupon).trim().toUpperCase();
    coupon = await Coupon.findOne({ code });
    const days = Math.max(1, Math.ceil((to - from) / 86400000));
    const prior = user ? await Booking.countDocuments({ customer: user._id, status: { $ne: 'Cancelled' } }) : 0;
    const check = checkCoupon(coupon, { days, priorBookings: prior });
    if (!check.ok) throw new ApiError(400, check.message);
  }
  const price = calcPrice({ car, mode, pickupDate: from, returnDate: to, coupon, gstRate: settings.gstRate });
  return { car, mode, from, to, price };
}

// POST /api/bookings/quote  (public): price preview, nothing is saved
exports.quote = asyncHandler(async (req, res) => {
  const { car, mode, from, to, price } = await buildQuote(req.body, req.user);
  const free = await carIsFree(car._id, from, to);
  res.json({ success: true, available: car.available && free, price, mode });
});

// POST /api/bookings
exports.create = asyncHandler(async (req, res) => {
  const b = req.body;
  const { car, mode, from, to, price } = await buildQuote(b, req.user);

  if (!car.available) throw new ApiError(409, 'This car is currently unavailable for booking.');
  if (!(await carIsFree(car._id, from, to))) {
    throw new ApiError(409, 'This car is already booked for part of this period. Choose different dates.');
  }

  let driver = null;
  if (mode === 'With Driver') {
    driver = await findFreeDriver(from, to);
    if (!driver) throw new ApiError(409, 'No driver is available for these dates. Try different dates or choose Self Drive.');
  }

  const seq = await Counter.next('booking');
  const booking = await Booking.create({
    bookingNo: `DOW-${10000 + seq}`,
    customer: req.user._id,
    car: car._id,
    bookingType: mode,
    pickupLocation: b.pickupLocation,
    returnLocation: b.returnLocation,
    pickupDate: from,
    returnDate: to,
    pickupTime: b.pickupTime || '10:00',
    returnTime: b.returnTime || '10:00',
    driver: driver ? driver._id : null,
    rentalAmount: price.payable,
    driverCharges: price.driver,
    securityDeposit: price.deposit,
    totalAmount: price.total,
    couponCode: price.couponApplied,
    price,
    contact: { name: b.name, email: String(b.email).toLowerCase(), phone: b.phone, licence: b.licence || '', notes: b.notes || '' },
  });

  // Two requests can pass the checks above at the same moment. The older booking (smaller _id) wins:
  // a newer one that finds an older overlapping booking removes itself and reports a conflict.
  const clash = await Booking.exists({
    _id: { $lt: booking._id }, status: { $in: BLOCKING_STATUSES }, ...overlap(from, to),
    $or: [{ car: car._id }, ...(driver ? [{ driver: driver._id }] : [])],
  });
  if (clash) {
    await booking.deleteOne();
    throw new ApiError(409, 'Someone else just booked this car or driver for these dates. Please choose different dates.');
  }

  if (driver) await Driver.updateOne({ _id: driver._id }, { $addToSet: { assignedBookings: booking._id } });
  await notify(req.user._id, `Booking ${booking.bookingNo} received. We will confirm it shortly.`);

  const full = await populate(Booking.findById(booking._id));
  res.status(201).json({ success: true, booking: bookingDTO(full) });
});

// GET /api/bookings/my  -> booking history of the logged-in customer
exports.mine = asyncHandler(async (req, res) => {
  const list = await populate(Booking.find({ customer: req.user._id }).sort('-pickupDate'));
  res.json({ success: true, count: list.length, bookings: list.map(bookingDTO) });
});

// GET /api/bookings  (admin) ?status=&q=&mode=
exports.all = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.mode) filter.bookingType = req.query.mode === 'driver' ? 'With Driver' : 'Self Drive';
  const list = await populate(Booking.find(filter).sort('-createdAt'));
  res.json({ success: true, count: list.length, bookings: list.map(bookingDTO) });
});

async function loadForUser(req) {
  const booking = await populate(Booking.findOne({ bookingNo: req.params.id.toUpperCase() }));
  if (!booking) throw new ApiError(404, 'Booking not found.');
  const owner = String(booking.customer) === String(req.user._id);
  if (!owner && req.user.role !== 'admin') throw new ApiError(404, 'Booking not found.'); // do not reveal other people's ids
  return booking;
}

// GET /api/bookings/:id  (owner or admin). Doubles as the invoice data source.
exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, booking: bookingDTO(await loadForUser(req)) });
});

// GET /api/bookings/track/:id?phone=  (public): status lookup, verified with the mobile number used to book
exports.track = asyncHandler(async (req, res) => {
  const booking = await populate(Booking.findOne({ bookingNo: req.params.id.toUpperCase() }));
  const phone = String(req.query.phone || '').trim();
  if (!booking || !phone || booking.contact?.phone !== phone) {
    throw new ApiError(404, 'No booking found for this ID and mobile number.');
  }
  const dto = bookingDTO(booking);
  // Public lookups get status details only, not the customer's contact data or prices.
  res.json({
    success: true,
    booking: {
      id: dto.id, carId: dto.carId, mode: dto.mode, status: dto.status, pickupDate: dto.pickupDate, returnDate: dto.returnDate,
      pickupTime: dto.pickupTime, returnTime: dto.returnTime, pickupLocation: dto.pickupLocation, returnLocation: dto.returnLocation,
      driver: dto.driver,
    },
  });
});

async function applyStatus(booking, next) {
  if (booking.status === next) throw new ApiError(400, `Booking is already ${next.toLowerCase()}.`);
  if (!STATUS_FLOW[booking.status].includes(next)) {
    throw new ApiError(400, `A ${booking.status.toLowerCase()} booking cannot be changed to ${next.toLowerCase()}.`);
  }
  booking.status = next;
  if (next === 'Completed' && booking.paymentStatus === 'Unpaid') booking.paymentStatus = 'Paid';
  if (next === 'Cancelled' && booking.paymentStatus === 'Paid') booking.paymentStatus = 'Refunded';
  await booking.save();
  await notify(booking.customer, `Your booking ${booking.bookingNo} is now ${next.toLowerCase()}.`);
}

// PATCH /api/bookings/:id/status  (admin) { status }
exports.setStatus = asyncHandler(async (req, res) => {
  const booking = await populate(Booking.findOne({ bookingNo: req.params.id.toUpperCase() }));
  if (!booking) throw new ApiError(404, 'Booking not found.');
  await applyStatus(booking, req.body.status);
  res.json({ success: true, booking: bookingDTO(booking) });
});

// PATCH /api/bookings/:id/cancel  (owner or admin)
exports.cancel = asyncHandler(async (req, res) => {
  const booking = await loadForUser(req);
  if (!['Pending', 'Approved'].includes(booking.status) && req.user.role !== 'admin') {
    throw new ApiError(400, 'Only pending or approved bookings can be cancelled.');
  }
  await applyStatus(booking, 'Cancelled');
  res.json({ success: true, booking: bookingDTO(booking) });
});

// PATCH /api/bookings/:id/complete  (admin)
exports.complete = asyncHandler(async (req, res) => {
  const booking = await populate(Booking.findOne({ bookingNo: req.params.id.toUpperCase() }));
  if (!booking) throw new ApiError(404, 'Booking not found.');
  await applyStatus(booking, 'Completed');
  res.json({ success: true, booking: bookingDTO(booking) });
});

// PATCH /api/bookings/:id/driver  (admin) { driverId: "<id>" | null }
exports.assignDriver = asyncHandler(async (req, res) => {
  const booking = await populate(Booking.findOne({ bookingNo: req.params.id.toUpperCase() }));
  if (!booking) throw new ApiError(404, 'Booking not found.');
  if (booking.bookingType !== 'With Driver') throw new ApiError(400, 'Drivers can only be assigned to With Driver bookings.');
  if (!BLOCKING_STATUSES.includes(booking.status)) throw new ApiError(400, 'This booking is closed, so its driver cannot be changed.');

  const previous = booking.driver?._id;
  const { driverId } = req.body;
  if (driverId) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new ApiError(404, 'Driver not found.');
    if (!driver.available) throw new ApiError(409, `${driver.name} is marked unavailable.`);
    if (!(await driverIsFree(driver._id, booking.pickupDate, booking.returnDate, booking._id))) {
      throw new ApiError(409, `${driver.name} is already assigned to another booking on these dates.`);
    }
    booking.driver = driver._id;
    await Driver.updateOne({ _id: driver._id }, { $addToSet: { assignedBookings: booking._id } });
  } else {
    booking.driver = null;
  }
  if (previous && String(previous) !== String(driverId || '')) {
    await Driver.updateOne({ _id: previous }, { $pull: { assignedBookings: booking._id } });
  }
  await booking.save();
  const fresh = await populate(Booking.findById(booking._id));
  if (driverId) await notify(booking.customer, `A driver has been assigned to your booking ${booking.bookingNo}.`);
  res.json({ success: true, booking: bookingDTO(fresh) });
});
