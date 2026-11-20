const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    licence: { type: String, required: true, trim: true },       // licence number
    licenceExpiry: { type: Date },
    experience: { type: Number, default: 1, min: 0 },            // years
    languages: { type: String, default: '' },
    available: { type: Boolean, default: true },                 // on duty / can be assigned
    assignedBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Driver', driverSchema);
