// Converts Mongo documents into the exact shapes the React frontend already uses.
const { toISO } = require('./dates');

const id = (v) => (v && v._id ? String(v._id) : v ? String(v) : null);

exports.userDTO = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  phone: u.phone || '',
  city: u.address?.city || '',
  address: u.address || {},
  licence: u.licence || '',
  role: u.role,
  status: u.status,
  joined: toISO(u.createdDate || u.createdAt),
});

exports.carDTO = (c) => ({
  id: c.carNo,
  _id: String(c._id),
  name: c.name,
  brand: c.brand,
  model: c.model,
  year: c.year,
  type: c.carType,
  fuel: c.fuelType,
  transmission: c.transmission,
  seats: c.seats,
  price: c.pricePerDay,
  rating: c.rating,
  reviews: c.reviewCount,
  mileage: c.mileage,
  engine: c.engine,
  power: c.power,
  luggage: c.luggage,
  description: c.description,
  features: c.features,
  images: c.images,
  available: c.available,
});

exports.driverDTO = (d) => ({
  id: String(d._id),
  name: d.name,
  phone: d.phone,
  email: d.email || '',
  licence: d.licence,
  experience: d.experience,
  languages: d.languages || '',
  available: d.available,
  assignedBookings: (d.assignedBookings || []).map(id),
});

// Booking must be populated with `car` (carNo) and optionally `driver`.
exports.bookingDTO = (b) => ({
  id: b.bookingNo,
  customerId: id(b.customer),
  carId: b.car?.carNo ?? null,
  mode: b.bookingType === 'With Driver' ? 'driver' : 'self',
  pickupLocation: b.pickupLocation,
  returnLocation: b.returnLocation,
  pickupDate: toISO(b.pickupDate),
  returnDate: toISO(b.returnDate),
  pickupTime: b.pickupTime,
  returnTime: b.returnTime,
  status: b.status,
  paymentStatus: b.paymentStatus,
  driverId: id(b.driver),
  driver: b.driver && b.driver.name ? { id: id(b.driver), name: b.driver.name, phone: b.driver.phone } : null,
  amount: b.totalAmount,
  rentalAmount: b.rentalAmount,
  driverCharges: b.driverCharges,
  securityDeposit: b.securityDeposit,
  coupon: b.couponCode || '',
  price: b.price || null,
  name: b.contact?.name || '',
  email: b.contact?.email || '',
  phone: b.contact?.phone || '',
  licence: b.contact?.licence || '',
  notes: b.contact?.notes || '',
  createdAt: toISO(b.createdAt),
});

exports.reviewDTO = (r) => ({
  id: String(r._id),
  carId: r.car?.carNo ?? null,
  name: r.customer?.name || 'Customer',
  rating: r.rating,
  text: r.review,
  date: toISO(r.date),
});

exports.couponDTO = (c) => ({
  id: String(c._id),
  code: c.code, type: c.type, value: c.value, max: c.max, minDays: c.minDays,
  firstBookingOnly: c.firstBookingOnly, label: c.label, active: c.active,
  expiresAt: c.expiresAt ? toISO(c.expiresAt) : '',
});

exports.notificationDTO = (n) => ({ id: String(n._id), text: n.text, read: n.read, date: toISO(n.createdAt) });

exports.settingsDTO = (s) => ({
  siteName: s.siteName, tagline: s.tagline, email: s.email, phone: s.phone, address: s.address, gstRate: s.gstRate,
});
