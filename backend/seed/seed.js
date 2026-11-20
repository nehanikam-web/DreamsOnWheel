/*
 * Seeds MongoDB with an admin, a demo customer, sample customers, 42 cars, drivers, bookings,
 * reviews and coupons.
 *   npm run seed           wipes the collections used by the app, then inserts sample data
 *   npm run seed:destroy   wipes the collections only
 * Refuses to run when NODE_ENV=production unless you pass --force.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Car = require('../models/Car');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const Message = require('../models/Message');
const Counter = require('../models/Counter');
const { calcPrice } = require('../utils/pricing');
const { parseDay } = require('../utils/dates');
const data = require('./data');
const cars = require('./cars.json');

const args = process.argv.slice(2);

async function wipe() {
  await Promise.all([User, Car, Driver, Booking, Review, Wishlist, Coupon, Notification, Settings, Message, Counter].map((m) => m.deleteMany({})));
}

async function run() {
  if (process.env.NODE_ENV === 'production' && !args.includes('--force')) {
    throw new Error('Refusing to wipe a production database. Re-run with --force if you really mean it.');
  }
  await connectDB();
  await wipe();
  if (args.includes('--destroy')) {
    console.log('All DreamsOnWheel collections emptied.');
    return;
  }

  const settings = await Settings.get();
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dreamsonwheel.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD || 'Demo@123';

  await User.create({ name: 'Admin User', email: adminEmail, phone: '9876543210', password: adminPassword, role: 'admin' });

  const users = {};
  for (const c of data.CUSTOMERS) {
    users[c.key] = await User.create({
      name: c.name, email: c.email, phone: c.phone, password: customerPassword, role: 'customer',
      address: { city: c.city }, licence: c.licence, status: c.status || 'Active', createdDate: new Date(c.joined),
    });
  }

  const carDocs = {};
  for (const c of cars) carDocs[c.carNo] = await Car.create(c);

  const drivers = {};
  for (const d of data.DRIVERS) { const { key, ...rest } = d; drivers[key] = await Driver.create(rest); }

  const coupons = {};
  for (const c of data.COUPONS) coupons[c.code] = await Coupon.create(c);

  let seq = 0;
  for (const [cust, carNo, mode, pickup, ret, status, drv, location] of data.BOOKINGS) {
    const car = carDocs[carNo];
    const user = users[cust];
    const bookingType = mode === 'driver' ? 'With Driver' : 'Self Drive';
    const price = calcPrice({ car, mode: bookingType, pickupDate: parseDay(pickup), returnDate: parseDay(ret), coupon: null, gstRate: settings.gstRate });
    seq += 1;
    const booking = await Booking.create({
      bookingNo: `DOW-${10000 + seq}`, customer: user._id, car: car._id, bookingType,
      pickupLocation: location, returnLocation: location, pickupDate: parseDay(pickup), returnDate: parseDay(ret),
      driver: drv ? drivers[drv]._id : null,
      rentalAmount: price.payable, driverCharges: price.driver, securityDeposit: price.deposit, totalAmount: price.total, price,
      status, paymentStatus: status === 'Completed' ? 'Paid' : 'Unpaid',
      contact: { name: user.name, email: user.email, phone: user.phone, licence: user.licence, notes: '' },
      createdAt: parseDay(pickup),
    });
    if (drv) await Driver.updateOne({ _id: drivers[drv]._id }, { $push: { assignedBookings: booking._id } });
  }
  await Counter.create({ _id: 'booking', seq });

  for (const [cust, carNo, rating, text, date] of data.REVIEWS) {
    await Review.create({ customer: users[cust]._id, car: carDocs[carNo]._id, rating, review: text, date: new Date(date) });
  }

  await Notification.create({ user: users.C100._id, text: 'Welcome to DreamsOnWheel. Use WELCOME10 for 10% off your first booking.' });

  console.log(`Seeded: 1 admin, ${data.CUSTOMERS.length} customers, ${cars.length} cars, ${data.DRIVERS.length} drivers, ${seq} bookings, ${data.REVIEWS.length} reviews, ${data.COUPONS.length} coupons.`);
  console.log(`Admin login:    ${adminEmail} / ${adminPassword}`);
  console.log(`Demo customer:  demo@dreamsonwheel.com / ${customerPassword}`);
}

run()
  .catch((err) => { console.error('Seed failed:', err.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
