import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, FileText, MapPinned } from 'lucide-react';
import CarImage from '../components/CarImage';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { formatDate, inr } from '../utils/pricing';
import { priceForBooking } from '../utils/bookingHelpers';

export default function BookingConfirmation() {
  const { id } = useParams();
  const { bookings, getCar, settings, user } = useApp();
  const booking = bookings.find((b) => b.id === id);
  const car = booking ? getCar(booking.carId) : null;

  if (!booking || !car || (booking.email && booking.email !== user?.email)) {
    return (
      <div className="notfound">
        <h1>Booking not found</h1>
        <p>We could not find this booking in your account.</p>
        <Link to="/profile" className="btn btn-primary">Go to My Bookings</Link>
      </div>
    );
  }

  const price = priceForBooking(booking, car, settings.gstRate);

  return (
    <div className="confirm">
      <div className="confirm-head">
        <div className="confirm-icon"><CheckCircle2 size={32} /></div>
        <h1>Booking received</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Your booking ID is <strong style={{ color: 'var(--text)' }}>{booking.id}</strong>. We will confirm it shortly and notify you here.
        </p>
      </div>

      <div className="panel">
        <div className="summary-car">
          <CarImage src={car.images[0]} alt={`${car.brand} ${car.name}`} />
          <div style={{ flex: 1 }}>
            <span className="brand">{car.brand}</span>
            <h3>{car.name}</h3>
            <span className="muted" style={{ fontSize: '0.85rem' }}>{booking.mode === 'driver' ? 'With driver' : 'Self drive'}</span>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="kv">
          <div><small>Pickup</small><strong>{formatDate(booking.pickupDate)}, {booking.pickupTime}</strong></div>
          <div><small>Return</small><strong>{formatDate(booking.returnDate)}, {booking.returnTime}</strong></div>
          <div><small>Pickup location</small><strong>{booking.pickupLocation}</strong></div>
          <div><small>Return location</small><strong>{booking.returnLocation}</strong></div>
          <div><small>Customer</small><strong>{booking.name}</strong></div>
          <div><small>Contact</small><strong>{booking.phone}</strong></div>
        </div>
      </div>

      <div className="panel">
        <h3>Price summary</h3>
        <div className="breakdown">
          <div><span>Car rental ({price.days} day{price.days > 1 ? 's' : ''})</span><span>{inr(price.rental)}</span></div>
          {booking.mode === 'driver' && <div><span>Driver charges</span><span>{inr(price.driver)}</span></div>}
          {price.discount > 0 && <div className="discount"><span>Discount ({booking.coupon})</span><span>- {inr(price.discount)}</span></div>}
          <div><span>GST</span><span>{inr(price.tax)}</span></div>
          <div><span>Security deposit (refundable)</span><span>{inr(price.deposit)}</span></div>
          <div className="total"><span>Total amount</span><span>{inr(price.total)}</span></div>
        </div>
      </div>

      <div className="row-between" style={{ marginTop: 22 }}>
        <Link to="/profile" className="btn btn-outline">My Bookings</Link>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to={`/track?id=${booking.id}`} className="btn btn-outline"><MapPinned size={16} /> Track booking</Link>
          <Link to={`/invoice/${booking.id}`} className="btn btn-primary"><FileText size={16} /> View invoice</Link>
        </div>
      </div>
    </div>
  );
}
