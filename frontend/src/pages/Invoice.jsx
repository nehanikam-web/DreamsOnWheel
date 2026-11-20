import { Link, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, inr } from '../utils/pricing';
import { priceForBooking } from '../utils/bookingHelpers';

export default function Invoice() {
  const { id } = useParams();
  const { bookings, getCar, settings, user, customers } = useApp();
  const booking = bookings.find((b) => b.id === id);
  const car = booking ? getCar(booking.carId) : null;
  const seedCustomer = booking ? customers.find((c) => c.id === booking.customerId) : null;
  const allowed = booking && user && (booking.email === user.email || booking.customerId === user.id);

  if (!booking || !car || !allowed) {
    return (
      <div className="notfound">
        <h1>Invoice not available</h1>
        <p>This invoice does not exist or belongs to another account.</p>
        <Link to="/profile" className="btn btn-primary">My Bookings</Link>
      </div>
    );
  }

  const price = priceForBooking(booking, car, settings.gstRate);
  const billName = booking.name || seedCustomer?.name || user.name;
  const billEmail = booking.email || seedCustomer?.email || user.email;
  const billPhone = booking.phone || seedCustomer?.phone || user.phone;

  return (
    <div className="container" style={{ padding: '32px 20px 64px' }}>
      <div className="row-between no-print" style={{ maxWidth: 800, margin: '0 auto 16px' }}>
        <Link to="/profile" className="btn btn-outline">Back to bookings</Link>
        <button className="btn btn-primary" onClick={() => window.print()}><Printer size={16} /> Print / Save as PDF</button>
      </div>

      <div className="invoice">
        <div className="invoice-head">
          <div>
            <h2>{settings.siteName}</h2>
            <small>{settings.address}<br />{settings.phone} · {settings.email}</small>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.5rem' }}>TAX INVOICE</h1>
            <small>Invoice no: INV-{booking.id.replace('DOW-', '')}<br />Date: {formatDate(booking.createdAt)}<br />Booking ID: {booking.id}</small>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 6 }}>
          <div>
            <small>BILLED TO</small>
            <p><strong>{billName}</strong><br />{billEmail}<br />{billPhone}</p>
          </div>
          <div>
            <small>TRIP</small>
            <p>
              <strong>{car.brand} {car.name}</strong> ({booking.mode === 'driver' ? 'With driver' : 'Self drive'})<br />
              {formatDate(booking.pickupDate)} {booking.pickupTime} to {formatDate(booking.returnDate)} {booking.returnTime}<br />
              {booking.pickupLocation}
            </p>
          </div>
        </div>

        <table>
          <thead><tr><th>Description</th><th className="num">Qty</th><th className="num">Rate</th><th className="num">Amount</th></tr></thead>
          <tbody>
            <tr><td>Car rental: {car.brand} {car.name}</td><td className="num">{price.days} day{price.days > 1 ? 's' : ''}</td><td className="num">{inr(car.price)}</td><td className="num">{inr(price.rental)}</td></tr>
            {booking.mode === 'driver' && (
              <tr><td>Professional driver charges</td><td className="num">{price.days} day{price.days > 1 ? 's' : ''}</td><td className="num">{inr(price.driverPerDay)}</td><td className="num">{inr(price.driver)}</td></tr>
            )}
            {price.discount > 0 && (
              <tr><td>Discount ({booking.coupon})</td><td className="num">-</td><td className="num">-</td><td className="num">- {inr(price.discount)}</td></tr>
            )}
            <tr><td>GST @ {settings.gstRate}%</td><td className="num">-</td><td className="num">-</td><td className="num">{inr(price.tax)}</td></tr>
            <tr><td>Security deposit (refundable)</td><td className="num">-</td><td className="num">-</td><td className="num">{inr(price.deposit)}</td></tr>
            <tr className="grand"><td colSpan={3}>Total</td><td className="num">{inr(price.total)}</td></tr>
          </tbody>
        </table>

        <small>
          Booking status: {booking.status}. The security deposit is refunded within 2 to 3 working days after the car is returned in the same condition.
         This is a computer generated invoice and needs no signature.
        </small>
      </div>
    </div>
  );
}
