import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Field from './Field';
import { useApp } from '../context/AppContext';
import { LOCATIONS } from '../data/seed';
import { addDays, calcPrice, inr, todayISO } from '../utils/pricing';

const DURATIONS = [
  { label: '1 day', days: 1 },
  { label: '2 days', days: 2 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
];

// Booking form shown on the car details page. Sends the choices on to the full booking page.
export default function QuickBookCard({ car, available }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { settings, isRangeFree } = useApp();
  const today = todayISO();

  const [mode, setMode] = useState(params.get('mode') === 'driver' ? 'driver' : 'self');
  const [form, setForm] = useState({
    pickupLocation: params.get('location') || '',
    pickupDate: params.get('pickup') || today,
    returnDate: params.get('ret') || addDays(today, 1),
  });
  const [error, setError] = useState('');

  const price = calcPrice({ car, mode, pickupDate: form.pickupDate, returnDate: form.returnDate, gstRate: settings.gstRate });

  const setPickup = (v) => setForm((f) => ({ ...f, pickupDate: v, returnDate: f.returnDate < v ? v : f.returnDate }));
  const setDuration = (n) => setForm((f) => ({ ...f, returnDate: addDays(f.pickupDate, Number(n)) }));

  const go = () => {
    if (!form.pickupLocation) return setError('Please select a pickup location.');
    if (form.pickupDate < today) return setError('Pickup date cannot be in the past.');
    if (form.returnDate < form.pickupDate) return setError('Return date must be on or after the pickup date.');
    if (!isRangeFree(car.id, form.pickupDate, form.returnDate)) return setError('This car is already booked for some of these dates. See the available dates below.');
    setError('');
    const q = new URLSearchParams({ mode, location: form.pickupLocation, pickup: form.pickupDate, ret: form.returnDate });
    navigate(`/book/${car.id}?${q.toString()}`);
  };

  return (
    <div className="panel booking-card">
      <div className="price-line">
        <strong>{inr(car.price)}</strong><span className="muted">/ day</span>
      </div>

      <div className="mode-toggle" role="group" aria-label="Rental type">
        <button type="button" className={mode === 'self' ? 'on' : ''} onClick={() => setMode('self')}>Self Drive</button>
        <button type="button" className={mode === 'driver' ? 'on' : ''} onClick={() => setMode('driver')}>With Driver</button>
      </div>

      <div className="stack">
        <Field label="Pickup location">
          <select value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}>
            <option value="">Select location</option>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <div className="form-grid">
          <Field label="Pickup date"><input type="date" min={today} value={form.pickupDate} onChange={(e) => setPickup(e.target.value)} /></Field>
          <Field label="Return date"><input type="date" min={form.pickupDate} value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} /></Field>
        </div>
        {mode === 'driver' && (
          <Field label="Preferred duration" hint="Sets the return date from your pickup date.">
            <select value={price.days} onChange={(e) => setDuration(e.target.value)}>
              {!DURATIONS.some((d) => d.days === price.days) && <option value={price.days}>{price.days} days</option>}
              {DURATIONS.map((d) => <option key={d.days} value={d.days}>{d.label}</option>)}
            </select>
          </Field>
        )}

        <div className="breakdown">
          <div><span>{inr(car.price)} x {price.days} day{price.days > 1 ? 's' : ''}</span><span>{inr(price.rental)}</span></div>
          {mode === 'driver' && <div><span>Driver charges ({inr(price.driverPerDay)} x {price.days})</span><span>{inr(price.driver)}</span></div>}
          <div><span>GST ({settings.gstRate}%)</span><span>{inr(price.tax)}</span></div>
          <div><span>Refundable security deposit</span><span>{inr(price.deposit)}</span></div>
          <div className="total"><span>Estimated total</span><span>{inr(price.total)}</span></div>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <button className="btn btn-primary btn-block btn-lg" disabled={!available} onClick={go}>
          {available ? 'Book Now' : 'Currently unavailable'}
        </button>
      </div>
    </div>
  );
}
