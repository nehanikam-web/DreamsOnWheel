import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Field from '../components/Field';
import CarImage from '../components/CarImage';
import { useApp } from '../context/AppContext';
import { LOCATIONS } from '../data/seed';
import { addDays, calcPrice, formatDate, inr, todayISO, validateCoupon } from '../utils/pricing';
import { validateBooking } from '../utils/validators';

const TIMES = ['06:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

export default function Booking() {
  const { carId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { cars, getCar, user, settings, coupons, isRangeFree, createBooking, notify } = useApp();
  const car = getCar(carId);
  const today = todayISO();

  const [form, setForm] = useState({
    mode: params.get('mode') === 'driver' ? 'driver' : 'self',
    pickupLocation: params.get('location') || '',
    returnLocation: params.get('location') || '',
    pickupDate: params.get('pickup') || today,
    returnDate: params.get('ret') || addDays(today, 1),
    pickupTime: '10:00',
    returnTime: '10:00',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    licence: user?.licence || '',
    notes: '',
    agree: false,
  });
  const [coupon, setCoupon] = useState('');
  const [couponState, setCouponState] = useState(null); // { ok, code, message }
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const price = useMemo(() => {
    if (!car) return null;
    return calcPrice({
      car, mode: form.mode, pickupDate: form.pickupDate, returnDate: form.returnDate,
      couponCode: couponState?.ok ? couponState.code : '', gstRate: settings.gstRate,
    });
  }, [car, form.mode, form.pickupDate, form.returnDate, couponState, settings.gstRate]);

  if (!car) {
    return (
      <div className="notfound">
        <h1>Car not found</h1>
        <p>Please choose a car from the fleet to start a booking.</p>
        <Link to="/cars" className="btn btn-primary">Explore cars</Link>
      </div>
    );
  }

  // Date clashes are checked per date range (isRangeFree on submit and again on the server)
  const available = car.available;

  const applyCoupon = (code = coupon) => {
    const res = validateCoupon(code, price.days);
    setCouponState(res);
    if (res.ok) setCoupon(res.code);
  };

  const setPickupDate = (v) => {
    setForm((f) => ({ ...f, pickupDate: v, returnDate: f.returnDate < v ? v : f.returnDate }));
    setCouponState(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validateBooking(form, today);
    if (!v.pickupDate && !v.returnDate && !isRangeFree(car.id, form.pickupDate, form.returnDate)) {
      v.pickupDate = 'This car is already booked for part of this period. Choose different dates.';
    }
    setErrors(v);
    if (!available) return setFormError('This car is currently unavailable.');
    if (Object.keys(v).length) return setFormError('Please fix the highlighted fields.');
    setFormError('');
    setBusy(true);

    const res = await createBooking({
      customerId: user.id, carId: car.id, mode: form.mode,
      pickupLocation: form.pickupLocation, returnLocation: form.returnLocation,
      pickupDate: form.pickupDate, returnDate: form.returnDate,
      pickupTime: form.pickupTime, returnTime: form.returnTime,
      name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), licence: form.licence.trim(),
      notes: form.notes.trim(), coupon: price.couponApplied,
    });
    setBusy(false);
    if (!res.ok) return setFormError(res.error);
    notify('Booking submitted');
    navigate(`/booking/confirmation/${res.booking.id}`);
  };

  return (
    <>
      <PageHeader title="Book your car" subtitle="Review your trip details and confirm the booking." crumbs={[{ label: 'Explore Cars', to: '/cars' }, { label: car.name, to: `/cars/${car.id}` }, { label: 'Booking' }]} />

      <form className="container booking-layout" onSubmit={submit} noValidate>
        <div className="stack" style={{ gap: 20 }}>
          <div className="steps" aria-hidden="true">
            <span className="step on"><i>1</i> Trip details</span>
            <span className="step on"><i>2</i> Your details</span>
            <span className="step"><i>3</i> Confirmation</span>
          </div>

          {formError && <div className="alert alert-error" role="alert">{formError}</div>}
          {!available && <div className="alert alert-warn">This car is not available for booking right now.</div>}

          <div className="panel">
            <div className="section-title">1. Select car and rental type</div>
            <div className="form-grid">
              <Field label="Car" className="full">
                <select value={car.id} onChange={(e) => navigate(`/book/${e.target.value}?${params.toString()}`)}>
                  {cars.map((c) => <option key={c.id} value={c.id} disabled={!c.available}>{c.brand} {c.name} ({inr(c.price)}/day){c.available ? '' : ' - unavailable'}</option>)}
                </select>
              </Field>
              <div className="full mode-toggle" role="group" aria-label="Rental type" style={{ marginBottom: 0 }}>
                <button type="button" className={form.mode === 'self' ? 'on' : ''} onClick={() => setForm({ ...form, mode: 'self' })}>Self Drive</button>
                <button type="button" className={form.mode === 'driver' ? 'on' : ''} onClick={() => setForm({ ...form, mode: 'driver' })}>With Driver</button>
              </div>
              <p className="full muted" style={{ fontSize: '0.85rem' }}>
                {form.mode === 'self'
                  ? 'You drive the car. A valid driving licence and security deposit are required.'
                  : `A professional driver is assigned to you. Driver charges of ${inr(price.driverPerDay)} per day are added separately (up to 10 hours and 250 km a day).`}
              </p>
            </div>
          </div>

          <div className="panel">
            <div className="section-title">2. Pickup and return</div>
            <div className="form-grid">
              <Field label="Pickup location" error={errors.pickupLocation}>
                <select value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value, returnLocation: form.returnLocation || e.target.value })}>
                  <option value="">Select location</option>
                  {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Return location" error={errors.returnLocation}>
                <select value={form.returnLocation} onChange={set('returnLocation')}>
                  <option value="">Select location</option>
                  {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Pickup date" error={errors.pickupDate}>
                <input type="date" min={today} value={form.pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
              </Field>
              <Field label="Pickup time">
                <select value={form.pickupTime} onChange={set('pickupTime')}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
              </Field>
              <Field label="Return date" error={errors.returnDate}>
                <input type="date" min={form.pickupDate} value={form.returnDate} onChange={(e) => { setForm({ ...form, returnDate: e.target.value }); setCouponState(null); }} />
              </Field>
              <Field label="Return time" error={errors.returnTime}>
                <select value={form.returnTime} onChange={set('returnTime')}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
              </Field>
            </div>
          </div>

          <div className="panel">
            <div className="section-title">3. Customer details</div>
            <div className="form-grid">
              <Field label="Full name" error={errors.name}><input type="text" value={form.name} onChange={set('name')} /></Field>
              <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={set('email')} /></Field>
              <Field label="Mobile number" error={errors.phone}><input type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={set('phone')} /></Field>
              <Field label={form.mode === 'self' ? 'Driving licence number' : 'Driving licence (optional)'} error={errors.licence}>
                <input type="text" placeholder="e.g. MH13 2020 0012345" value={form.licence} onChange={set('licence')} />
              </Field>
              <Field label="Special requests (optional)" className="full">
                <textarea style={{ minHeight: 70 }} value={form.notes} onChange={set('notes')} placeholder="Child seat, early pickup, route preference..." />
              </Field>
              <Field error={errors.agree} className="full">
                <span className="check"><input type="checkbox" checked={form.agree} onChange={set('agree')} /> I confirm the details above are correct and accept the rental terms, including the cancellation policy.</span>
              </Field>
            </div>
          </div>
        </div>

        <aside className="stack" style={{ position: 'sticky', top: 88, gap: 20 }}>
          <div className="panel">
            <div className="summary-car">
              <CarImage src={car.images[0]} alt={`${car.brand} ${car.name}`} />
              <div>
                <span className="brand">{car.brand}</span>
                <h3>{car.name}</h3>
                <span className="muted" style={{ fontSize: '0.82rem' }}>{car.fuel} · {car.transmission} · {car.seats} seats</span>
              </div>
            </div>
            <div className="muted" style={{ fontSize: '0.85rem', marginBottom: 14 }}>
              {formatDate(form.pickupDate)}, {form.pickupTime} to {formatDate(form.returnDate)}, {form.returnTime} ({price.days} day{price.days > 1 ? 's' : ''})
            </div>

            <div className="section-title" style={{ marginBottom: 8 }}>Coupon code</div>
            <div className="coupon-row">
              <input type="text" value={coupon} placeholder="Enter code" onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponState(null); }} aria-label="Coupon code" />
              <button type="button" className="btn btn-dark" onClick={() => applyCoupon()}>Apply</button>
            </div>
            {couponState && <p className={`coupon-msg ${couponState.ok ? 'ok' : 'bad'}`}>{couponState.ok ? `${couponState.code} applied: ${couponState.message}` : couponState.message}</p>}
            <div className="coupon-chips">
              {Object.keys(coupons).map((c) => <button type="button" key={c} onClick={() => { setCoupon(c); applyCoupon(c); }}>{c}</button>)}
            </div>
          </div>

          <div className="panel">
            <div className="section-title">Price breakdown</div>
            <div className="breakdown">
              <div><span>{inr(car.price)} x {price.days} day{price.days > 1 ? 's' : ''}</span><span>{inr(price.rental)}</span></div>
              {form.mode === 'driver' && <div><span>Driver charges ({inr(price.driverPerDay)} x {price.days})</span><span>{inr(price.driver)}</span></div>}
              {price.discount > 0 && <div className="discount"><span>Coupon discount ({price.couponApplied})</span><span>- {inr(price.discount)}</span></div>}
              <div><span>GST ({settings.gstRate}%)</span><span>{inr(price.tax)}</span></div>
              <div><span>Rental amount</span><span>{inr(price.payable)}</span></div>
              <div><span>Security deposit (refundable)</span><span>{inr(price.deposit)}</span></div>
              <div className="total"><span>Total amount</span><span>{inr(price.total)}</span></div>
            </div>
            <button className="btn btn-primary btn-block btn-lg mt" disabled={!available || busy}>{busy ? <><span className="spinner spinner-sm" />Confirming...</> : 'Confirm booking'}</button>
            <p className="muted" style={{ fontSize: '0.78rem', marginTop: 10, textAlign: 'center' }}>No payment is taken online. Pay at pickup.</p>
          </div>
        </aside>
      </form>
    </>
  );
}
