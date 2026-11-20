const mongoose = require('mongoose');
const { BOOKING_TYPES, BOOKING_STATUSES, PAYMENT_STATUSES } = require('../config/constants');

const priceSchema = new mongoose.Schema(
  {
    days: Number, rental: Number, driverPerDay: Number, driver: Number, discount: Number, tax: Number,
    deposit: Number, subtotal: Number, payable: Number, total: Number, couponApplied: String,
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    bookingNo: { type: String, unique: true, index: true },       // e.g. DOW-10017
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true, index: true },
    bookingType: { type: String, enum: BOOKING_TYPES, required: true },
    pickupLocation: { type: String, required: true },
    returnLocation: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    pickupTime: { type: String, default: '10:00' },
    returnTime: { type: String, default: '10:00' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    rentalAmount: { type: Number, required: true },
    driverCharges: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    couponCode: { type: String, default: '' },
    price: priceSchema,                                            // full price snapshot for invoices
    status: { type: String, enum: BOOKING_STATUSES, default: 'Pending', index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Unpaid' },
    // Contact details captured at booking time (kept even if the profile changes later)
    contact: {
      name: String, email: String, phone: String, licence: String, notes: String,
    },
  },
  { timestamps: true },
);

// Overlap lookups: same car, blocking statuses, date range.
bookingSchema.index({ car: 1, status: 1, pickupDate: 1, returnDate: 1 });
bookingSchema.index({ driver: 1, status: 1, pickupDate: 1, returnDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
