import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import BookingTimeline from '../components/BookingTimeline';
import StatusBadge from '../components/StatusBadge';
import Field from '../components/Field';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/pricing';
import { trackBooking } from '../services/bookingService';

export default function TrackBooking() {
  const [params] = useSearchParams();
  const { bookings, getCar } = useApp();
  const [input, setInput] = useState(params.get('id') || '');
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  // A signed-in customer can always see their own bookings; anyone else needs the booking ID plus mobile number.
  const lookup = async (id, mobile) => {
    const key = id.trim().toLowerCase();
    if (!key) return;
    setBusy(true);
    setError('');
    const own = bookings.find((b) => b.id.toLowerCase() === key);
    if (own) {
      setBooking(own);
    } else {
      const res = await trackBooking(id.trim(), mobile.trim());
      setBooking(res.ok ? res.data.booking : null);
      if (!res.ok) setError(res.error);
    }
    setSearched(true);
    setBusy(false);
  };

  useEffect(() => {
    if (params.get('id')) lookup(params.get('id'), '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const car = booking ? getCar(booking.carId) : null;
  const driver = booking?.driver || null;

  const submit = (e) => {
    e.preventDefault();
    lookup(input, phone);
  };

  return (
    <>
      <PageHeader title="Track your booking" subtitle="Enter your booking ID to see its current status." crumbs={[{ label: 'Track Booking' }]} />
      <div className="container" style={{ maxWidth: 780, padding: '32px 20px 64px' }}>
        <form className="panel stack" onSubmit={submit}>
          <div className="form-grid">
            <Field label="Booking ID"><input type="text" placeholder="e.g. DOW-10012" value={input} onChange={(e) => setInput(e.target.value)} /></Field>
            <Field label="Mobile number (for verification)" hint="Not needed for bookings in your own account."><input type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={busy}><Search size={16} /> {busy ? 'Checking...' : 'Track'}</button>
        </form>

        {searched && !booking && <div className="alert alert-error mt">{error || 'No booking found with this ID. Check the ID in your confirmation or My Bookings.'}</div>}

        {searched && booking && car && (
          <div className="panel mt">
            <div className="row-between" style={{ marginBottom: 20 }}>
              <div>
                <span className="brand">{booking.id}</span>
                <h3>{car.brand} {car.name}</h3>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <BookingTimeline status={booking.status} />
            <div className="kv mt">
              <div><small>Pickup</small><strong>{formatDate(booking.pickupDate)}, {booking.pickupTime}</strong></div>
              <div><small>Return</small><strong>{formatDate(booking.returnDate)}, {booking.returnTime}</strong></div>
              <div><small>Pickup location</small><strong>{booking.pickupLocation}</strong></div>
              <div><small>Rental type</small><strong>{booking.mode === 'driver' ? 'With driver' : 'Self drive'}</strong></div>
              {driver && <div><small>Assigned driver</small><strong>{driver.name} ({driver.phone})</strong></div>}
            </div>
            <div style={{ marginTop: 18 }}>
              <Link to={`/invoice/${booking.id}`} className="btn btn-outline btn-sm">View invoice</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
