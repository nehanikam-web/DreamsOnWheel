const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true, min: 1 },
    max: { type: Number, default: 0 },          // cap for percent coupons (0 = no cap)
    minDays: { type: Number, default: 0 },
    firstBookingOnly: { type: Boolean, default: false },
    label: { type: String, default: '' },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Coupon', couponSchema);
