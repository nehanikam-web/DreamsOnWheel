const mongoose = require('mongoose');
const { DEFAULT_SETTINGS } = require('../config/constants');

// Single-document collection with the website information.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    siteName: { type: String, default: DEFAULT_SETTINGS.siteName },
    tagline: { type: String, default: DEFAULT_SETTINGS.tagline },
    email: { type: String, default: DEFAULT_SETTINGS.email },
    phone: { type: String, default: DEFAULT_SETTINGS.phone },
    address: { type: String, default: DEFAULT_SETTINGS.address },
    gstRate: { type: Number, default: DEFAULT_SETTINGS.gstRate, min: 0, max: 40 },
  },
  { timestamps: true },
);

settingsSchema.statics.get = async function get() {
  return this.findOneAndUpdate({ key: 'site' }, { $setOnInsert: { key: 'site' } }, { new: true, upsert: true });
};

module.exports = mongoose.model('Settings', settingsSchema);
