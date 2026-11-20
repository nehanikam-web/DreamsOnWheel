const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { driverDTO } = require('../utils/serializers');
const { BLOCKING_STATUSES } = require('../config/constants');

const pick = (b) => Object.fromEntries(
  ['name', 'phone', 'email', 'licence', 'experience', 'languages', 'available', 'licenceExpiry'].filter((k) => b[k] !== undefined).map((k) => [k, b[k]]),
);

exports.list = asyncHandler(async (req, res) => {
  const drivers = await Driver.find().sort('name');
  res.json({ success: true, count: drivers.length, drivers: drivers.map(driverDTO) });
});

exports.get = asyncHandler(async (req, res) => {
  const d = await Driver.findById(req.params.id);
  if (!d) throw new ApiError(404, 'Driver not found.');
  res.json({ success: true, driver: driverDTO(d) });
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, driver: driverDTO(await Driver.create(pick(req.body))) });
});

exports.update = asyncHandler(async (req, res) => {
  const d = await Driver.findById(req.params.id);
  if (!d) throw new ApiError(404, 'Driver not found.');
  Object.assign(d, pick(req.body));
  await d.save();
  res.json({ success: true, driver: driverDTO(d) });
});

exports.remove = asyncHandler(async (req, res) => {
  const d = await Driver.findById(req.params.id);
  if (!d) throw new ApiError(404, 'Driver not found.');
  const open = await Booking.countDocuments({ driver: d._id, status: { $in: BLOCKING_STATUSES } });
  if (open) throw new ApiError(409, `${d.name} is assigned to ${open} open booking(s). Reassign them first.`);
  await d.deleteOne();
  res.json({ success: true, message: 'Driver deleted.' });
});
