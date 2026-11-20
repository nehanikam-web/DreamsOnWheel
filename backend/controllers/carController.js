const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Wishlist = require('../models/Wishlist');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { carDTO } = require('../utils/serializers');
const { toISO, todayUTC } = require('../utils/dates');
const { BLOCKING_STATUSES } = require('../config/constants');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Accepts the frontend field names (price, fuel, type) and the schema names (pricePerDay, fuelType, carType).
function fromBody(b) {
  const map = {
    name: b.name, brand: b.brand, model: b.model, year: b.year,
    pricePerDay: b.price ?? b.pricePerDay, fuelType: b.fuel ?? b.fuelType, transmission: b.transmission,
    seats: b.seats, carType: b.type ?? b.carType, mileage: b.mileage, engine: b.engine, power: b.power,
    luggage: b.luggage, description: b.description, features: b.features, images: b.images, available: b.available,
  };
  return Object.fromEntries(Object.entries(map).filter(([, v]) => v !== undefined));
}

const findByNo = async (param) => {
  const car = await Car.findOne({ carNo: Number(param) });
  if (!car) throw new ApiError(404, 'Car not found.');
  return car;
};

// GET /api/cars?q=&brand=&fuel=&transmission=&type=&minPrice=&maxPrice=&available=&sort=price_asc|price_desc|rating
exports.list = asyncHandler(async (req, res) => {
  const { q, brand, fuel, transmission, type, minPrice, maxPrice, available, sort, page, limit } = req.query;
  const filter = {};
  if (q) filter.$or = [{ name: new RegExp(escapeRe(q), 'i') }, { brand: new RegExp(escapeRe(q), 'i') }];
  if (brand) filter.brand = brand;
  if (fuel) filter.fuelType = fuel;
  if (transmission) filter.transmission = transmission;
  if (type) filter.carType = type;
  if (available !== undefined) filter.available = available === 'true';
  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }
  const order = { price_asc: { pricePerDay: 1 }, price_desc: { pricePerDay: -1 }, rating: { rating: -1 } }[sort] || { carNo: 1 };

  let query = Car.find(filter).sort(order);
  if (limit) {
    const l = Math.min(100, Math.max(1, Number(limit)));
    query = query.skip((Math.max(1, Number(page) || 1) - 1) * l).limit(l);
  }
  const [cars, total] = await Promise.all([query, Car.countDocuments(filter)]);
  res.json({ success: true, total, count: cars.length, cars: cars.map(carDTO) });
});

// GET /api/cars/availability  -> { "<carNo>": [{ from, to, status }] } for current and future blocking bookings.
// Contains no personal data, so it is public. The frontend uses it for date filters and the "Rented" badge.
exports.availability = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ status: { $in: BLOCKING_STATUSES }, returnDate: { $gte: todayUTC() } })
    .populate('car', 'carNo').select('car pickupDate returnDate status').sort('pickupDate');
  const out = {};
  bookings.forEach((b) => {
    if (!b.car) return;
    (out[b.car.carNo] ||= []).push({ from: toISO(b.pickupDate), to: toISO(b.returnDate), status: b.status });
  });
  res.json({ success: true, availability: out });
});

exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, car: carDTO(await findByNo(req.params.id)) });
});

exports.create = asyncHandler(async (req, res) => {
  const last = await Car.findOne().sort('-carNo').select('carNo');
  const data = fromBody(req.body);
  const car = await Car.create({ ...data, model: data.model || data.name, carNo: (last?.carNo || 0) + 1 });
  res.status(201).json({ success: true, car: carDTO(car) });
});

exports.update = asyncHandler(async (req, res) => {
  const car = await findByNo(req.params.id);
  Object.assign(car, fromBody(req.body));
  await car.save();
  res.json({ success: true, car: carDTO(car) });
});

// PATCH /api/cars/:id/availability
exports.setAvailability = asyncHandler(async (req, res) => {
  const car = await findByNo(req.params.id);
  car.available = Boolean(req.body.available);
  await car.save();
  res.json({ success: true, car: carDTO(car) });
});

exports.remove = asyncHandler(async (req, res) => {
  const car = await findByNo(req.params.id);
  const open = await Booking.countDocuments({ car: car._id, status: { $in: BLOCKING_STATUSES } });
  if (open) throw new ApiError(409, `This car has ${open} open booking(s). Complete or cancel them before deleting the car.`);
  await car.deleteOne();
  await Wishlist.updateMany({}, { $pull: { cars: car._id } });
  res.json({ success: true, message: 'Car deleted.' });
});
