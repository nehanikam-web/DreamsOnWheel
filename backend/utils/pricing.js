const { DEPOSIT_BY_TYPE, DRIVER_RATE_BY_TYPE } = require('../config/constants');
const { rentalDays } = require('./dates');

// Returns { ok, message } for a coupon document against a rental.
exports.checkCoupon = (coupon, { days, priorBookings = 0 }) => {
  if (!coupon || !coupon.active) return { ok: false, message: 'This coupon code is not valid.' };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, message: 'This coupon has expired.' };
  if (coupon.minDays && days < coupon.minDays) {
    return { ok: false, message: `This coupon needs a rental of ${coupon.minDays} days or more.` };
  }
  if (coupon.firstBookingOnly && priorBookings > 0) {
    return { ok: false, message: 'This coupon is only valid on your first booking.' };
  }
  return { ok: true };
};

// Authoritative price calculation. The client never decides what a booking costs.
exports.calcPrice = ({ car, mode, pickupDate, returnDate, coupon, gstRate }) => {
  const days = rentalDays(pickupDate, returnDate);
  const rental = car.pricePerDay * days;
  const driverPerDay = mode === 'With Driver' ? DRIVER_RATE_BY_TYPE[car.carType] || 0 : 0;
  const driver = driverPerDay * days;

  let discount = 0;
  if (coupon) {
    discount = coupon.type === 'flat'
      ? coupon.value
      : Math.min(((rental + driver) * coupon.value) / 100, coupon.max || Infinity);
    discount = Math.min(discount, rental + driver);
  }
  const taxable = rental + driver - discount;
  const tax = (taxable * gstRate) / 100;
  const deposit = DEPOSIT_BY_TYPE[car.carType] || 5000;
  const payable = taxable + tax;
  const r = (n) => Math.round(n * 100) / 100;
  return {
    days, rental: r(rental), driverPerDay, driver: r(driver), discount: r(discount), tax: r(tax),
    deposit, subtotal: r(rental + driver), payable: r(payable), total: r(payable + deposit),
    couponApplied: coupon ? coupon.code : '',
  };
};
