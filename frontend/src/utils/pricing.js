import { COUPONS as DEFAULT_COUPONS } from '../data/seed';
import { DEPOSIT_BY_TYPE, DRIVER_RATE_BY_TYPE } from '../data/cars';

export const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function addDays(iso, n) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Whole rental days, minimum 1. Dates are ISO strings (yyyy-mm-dd).
export function rentalDays(pickup, ret) {
  if (!pickup || !ret) return 1;
  const ms = new Date(ret) - new Date(pickup);
  return Math.max(1, Math.ceil(ms / 86400000));
}

// Coupons come from the backend (see AppContext); the static list is only a fallback.
let couponRegistry = DEFAULT_COUPONS;
export const setCouponRegistry = (coupons) => { couponRegistry = coupons; };

export function validateCoupon(code, days) {
  const key = (code || '').trim().toUpperCase();
  const c = couponRegistry[key];
  if (!key) return { ok: false, message: 'Enter a coupon code.' };
  if (!c) return { ok: false, message: 'This coupon code is not valid.' };
  if (c.minDays && days < c.minDays) return { ok: false, message: `This coupon needs a rental of ${c.minDays} days or more.` };
  return { ok: true, code: key, coupon: c, message: c.label };
}

// Price breakdown used by the booking form, details page, invoice and confirmation page.
export function calcPrice({ car, mode, pickupDate, returnDate, couponCode, gstRate = 12 }) {
  const days = rentalDays(pickupDate, returnDate);
  const rental = car.price * days;
  const driverPerDay = mode === 'driver' ? DRIVER_RATE_BY_TYPE[car.type] : 0;
  const driver = driverPerDay * days;

  let discount = 0;
  const check = couponCode ? validateCoupon(couponCode, days) : null;
  if (check?.ok) {
    const c = check.coupon;
    discount = c.type === 'flat' ? c.value : Math.min(((rental + driver) * c.value) / 100, c.max || Infinity);
  }

  const taxable = rental + driver - discount;
  const tax = (taxable * gstRate) / 100;
  const deposit = DEPOSIT_BY_TYPE[car.type] || 5000;
  const payable = taxable + tax;
  return {
    days, rental, driverPerDay, driver, discount, tax, deposit,
    subtotal: rental + driver,
    payable,                  // rental + driver - discount + GST
    total: payable + deposit, // amount collected up front, deposit is refundable
    couponApplied: check?.ok ? check.code : '',
  };
}
