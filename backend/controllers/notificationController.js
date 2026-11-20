const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { notificationDTO } = require('../utils/serializers');

exports.mine = asyncHandler(async (req, res) => {
  const list = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
  res.json({ success: true, notifications: list.map(notificationDTO) });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});
