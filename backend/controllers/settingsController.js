const Settings = require('../models/Settings');
const Car = require('../models/Car');
const Driver = require('../models/Driver');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { settingsDTO } = require('../utils/serializers');

exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, settings: settingsDTO(await Settings.get()) });
});

exports.update = asyncHandler(async (req, res) => {
  const s = await Settings.get();
  ['siteName', 'tagline', 'email', 'phone', 'address', 'gstRate'].forEach((k) => { if (req.body[k] !== undefined) s[k] = req.body[k]; });
  await s.save();
  res.json({ success: true, settings: settingsDTO(s) });
});

// GET /api/stats/public: numbers shown on the About page
exports.publicStats = asyncHandler(async (req, res) => {
  const [cars, drivers] = await Promise.all([Car.countDocuments(), Driver.countDocuments()]);
  res.json({ success: true, stats: { cars, drivers } });
});

// POST /api/contact (public)
exports.contact = asyncHandler(async (req, res) => {
  await Message.create({ name: req.body.name, email: req.body.email, subject: req.body.subject, message: req.body.message });
  res.status(201).json({ success: true, message: 'Message received.' });
});

// GET /api/contact (admin)
exports.messages = asyncHandler(async (req, res) => {
  res.json({ success: true, messages: await Message.find().sort('-createdAt').limit(200) });
});
