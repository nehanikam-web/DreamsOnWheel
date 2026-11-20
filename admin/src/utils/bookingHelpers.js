import { calcPrice } from './pricing';

// New bookings store a price snapshot. Older seed bookings don't, so rebuild it from the car.
export function priceForBooking(booking, car, gstRate) {
  if (booking.price) return booking.price;
  if (!car) return null;
  return calcPrice({
    car, mode: booking.mode, pickupDate: booking.pickupDate, returnDate: booking.returnDate,
    couponCode: booking.coupon, gstRate,
  });
}
