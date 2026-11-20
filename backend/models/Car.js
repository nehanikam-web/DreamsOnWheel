const mongoose = require('mongoose');
const { CAR_TYPES, FUEL_TYPES, TRANSMISSIONS } = require('../config/constants');

const carSchema = new mongoose.Schema(
  {
    carNo: { type: Number, unique: true, index: true }, // public numeric id used in URLs
    name: { type: String, required: true, trim: true },  // car name and model, e.g. "Creta SX"
    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, trim: true, default: '' },
    year: { type: Number, default: 2024 },
    pricePerDay: { type: Number, required: true, min: 1 },
    fuelType: { type: String, enum: FUEL_TYPES, required: true },
    transmission: { type: String, enum: TRANSMISSIONS, required: true },
    seats: { type: Number, required: true, min: 2, max: 12 },
    carType: { type: String, enum: CAR_TYPES, required: true },
    mileage: { type: String, required: true, trim: true },
    engine: { type: String, default: '-' },
    power: { type: String, default: '-' },
    luggage: { type: String, default: '-' },
    description: { type: String, default: '' },
    features: [{ type: String }],
    images: [{ type: String }],
    rating: { type: Number, default: 4, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
  },
  { timestamps: true },
);

carSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Car', carSchema);
