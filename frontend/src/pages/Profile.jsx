import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarCheck, Heart, History, LogOut, Pencil, User } from 'lucide-react';
import CarImage from '../components/CarImage';
import CarCard from '../components/CarCard';
import Field from '../components/Field';
import Modal from '../components/Modal';
import PasswordInput from '../components/PasswordInput';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { formatDate, inr } from '../utils/pricing';
import { isPhone, passwordIssues } from '../utils/validators';
import { priceForBooking } from '../utils/bookingHelpers';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'bookings', label: 'My Bookings', icon: CalendarCheck },
  { id: 'history', label: 'Booking History', icon: History },
  { id: 'favourites', label: 'Favourites', icon: Heart },
  { id: 'edit', label: 'Edit Profile', icon: Pencil },
];

function BookingList({ items, empty, onCancel }) {
  const { getCar, settings } = useApp();
  if (items.length === 0) {
    return (
      <div className="empty">
        <h3>{empty}</h3>
        <Link to="/cars" className="btn btn-primary mt">Explore cars</Link>
      </div>
    );
  }
  return (
    <div>
      {items.map((b) => {
        const car = getCar(b.carId);
        const price = priceForBooking(b, car, settings.gstRate);
        return (
          <div className="booking-row" key={b.id}>
            {car ? <CarImage src={car.images[0]} alt={car.name} /> : <div className="car-img-fallback">Car removed</div>}
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong>{car ? `${car.brand} ${car.name}` : 'Car no longer listed'}</strong>
                <StatusBadge status={b.status} />
              </div>
              <small>{b.id} · {b.mode === 'driver' ? 'With driver' : 'Self drive'}</small>
              <div style={{ fontSize: '0.88rem', marginTop: 4 }}>
                {formatDate(b.pickupDate)} to {formatDate(b.returnDate)} · {b.pickupLocation}
              </div>
              {price && b.status !== 'Cancelled' && <div style={{ fontSize: '0.88rem' }}>Total: <strong>{inr(price.total)}</strong></div>}
            </div>
            <div className="booking-actions">
              <Link to={`/track?id=${b.id}`} className="btn btn-outline btn-sm">Track</Link>
              <Link to={`/invoice/${b.id}`} className="btn btn-outline btn-sm">Invoice</Link>
              {onCancel && ['Pending', 'Approved'].includes(b.status) && (
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--bad)' }} onClick={() => onCancel(b)}>Cancel</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EditProfile() {
  const { user, updateProfile, changePassword, notify } = useApp();
  const [form, setForm] = useState({ name: user.name, phone: user.phone, city: user.city || '', licence: user.licence || '' });
  const [errors, setErrors] = useState({});
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});

  const saveProfile = async (e) => {
    e.preventDefault();
    const v = {};
    if (form.name.trim().length < 3) v.name = 'Enter your full name.';
    if (!isPhone(form.phone)) v.phone = 'Enter a valid 10-digit mobile number.';
    setErrors(v);
    if (Object.keys(v).length) return;
    const res = await updateProfile({ name: form.name.trim(), phone: form.phone.trim(), city: form.city.trim(), licence: form.licence.trim() });
    if (!res.ok) return notify(res.error, 'error');
    return notify('Profile updated');
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const v = {};
    if (!pw.current) v.current = 'Enter your current password.';
    const issues = passwordIssues(pw.next);
    if (issues.length) v.next = 'Password needs ' + issues.join(', ') + '.';
    if (pw.confirm !== pw.next) v.confirm = 'Passwords do not match.';
    if (!v.current && !v.next && !v.confirm) {
      const res = await changePassword(pw.current, pw.next);
      if (!res.ok) v.current = res.error;
    }
    setPwErrors(v);
    if (Object.keys(v).length) return;
    setPw({ current: '', next: '', confirm: '' });
    notify('Password changed');
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <form className="panel stack" onSubmit={saveProfile} noValidate>
        <h3>Personal details</h3>
        <div className="form-grid">
          <Field label="Full name" error={errors.name}><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email" hint="Email cannot be changed."><input type="email" value={user.email} disabled /></Field>
          <Field label="Mobile number" error={errors.phone}><input type="tel" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="City"><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="Driving licence number" className="full"><input type="text" value={form.licence} onChange={(e) => setForm({ ...form, licence: e.target.value })} /></Field>
        </div>
        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save changes</button>
      </form>

      <form className="panel stack" onSubmit={savePassword} noValidate>
        <h3>Change password</h3>
        <Field label="Current password" error={pwErrors.current}><PasswordInput autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
        <div className="form-grid">
          <Field label="New password" error={pwErrors.next}><PasswordInput autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
          <Field label="Confirm new password" error={pwErrors.confirm}><PasswordInput autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
        </div>
        <button className="btn btn-dark" style={{ alignSelf: 'flex-start' }}>Update password</button>
      </form>
    </div>
  );
}

export default function Profile() {
  const { user, bookingsForEmail, setBookingStatus, logout, cars, wishlist, recent, getCar, notify } = useApp();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'profile';
  const [cancelTarget, setCancelTarget] = useState(null);

  const mine = bookingsForEmail(user.email).sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));
  const current = mine.filter((b) => ['Pending', 'Approved', 'Active'].includes(b.status));
  const history = mine.filter((b) => ['Completed', 'Cancelled'].includes(b.status));
  const favourites = cars.filter((c) => wishlist.includes(c.id));
  const recentCars = recent.map(getCar).filter(Boolean).slice(0, 4);

  const confirmCancel = async () => {
    const res = await setBookingStatus(cancelTarget.id, 'Cancelled');
    if (res.ok) notify(`Booking ${cancelTarget.id} cancelled`);
    else notify(res.error, 'error');
    setCancelTarget(null);
  };

  return (
    <div className="container account">
      <aside className="account-nav">
        <div className="account-user">
          <span className="avatar">{user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
          <div><strong>{user.name}</strong><small>{user.email}</small></div>
        </div>
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setParams({ tab: t.id })}>
            <t.icon size={17} /> {t.label}
          </button>
        ))}
        <button onClick={() => { logout(); navigate('/'); }}><LogOut size={17} /> Logout</button>
      </aside>

      <section>
        {tab === 'profile' && (
          <div className="stack" style={{ gap: 20 }}>
            <div className="panel">
              <h3>My Profile</h3>
              <div className="kv">
                <div><small>Full name</small><strong>{user.name}</strong></div>
                <div><small>Email</small><strong>{user.email}</strong></div>
                <div><small>Mobile</small><strong>{user.phone || '-'}</strong></div>
                <div><small>City</small><strong>{user.city || '-'}</strong></div>
                <div><small>Driving licence</small><strong>{user.licence || 'Not added'}</strong></div>
                <div><small>Member since</small><strong>{formatDate(user.joined)}</strong></div>
              </div>
              <button className="btn btn-outline mt" onClick={() => setParams({ tab: 'edit' })}>Edit profile</button>
            </div>
            <div className="grid-3">
              <div className="stat"><strong>{mine.length}</strong>Total bookings</div>
              <div className="stat"><strong>{current.length}</strong>Upcoming / active</div>
              <div className="stat"><strong>{wishlist.length}</strong>Favourite cars</div>
            </div>
            {recentCars.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 12 }}>Recently viewed</h3>
                <div className="car-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                  {recentCars.map((c) => <CarCard key={c.id} car={c} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'bookings' && (
          <>
            <h2 style={{ marginBottom: 16 }}>My Bookings</h2>
            <BookingList items={current} empty="You have no upcoming bookings" onCancel={setCancelTarget} />
          </>
        )}

        {tab === 'history' && (
          <>
            <h2 style={{ marginBottom: 16 }}>Booking History</h2>
            <BookingList items={history} empty="No past bookings yet" />
          </>
        )}

        {tab === 'favourites' && (
          <>
            <h2 style={{ marginBottom: 16 }}>Favourite Cars</h2>
            {favourites.length === 0 ? (
              <div className="empty"><h3>No favourites yet</h3><p>Tap the heart on any car to save it here.</p><Link to="/cars" className="btn btn-primary mt">Explore cars</Link></div>
            ) : (
              <div className="car-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {favourites.map((c) => <CarCard key={c.id} car={c} />)}
              </div>
            )}
          </>
        )}

        {tab === 'edit' && (
          <>
            <h2 style={{ marginBottom: 16 }}>Edit Profile</h2>
            <EditProfile />
          </>
        )}
      </section>

      {cancelTarget && (
        <Modal
          title="Cancel this booking?"
          onClose={() => setCancelTarget(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setCancelTarget(null)}>Keep booking</button>
            <button className="btn btn-danger" onClick={confirmCancel}>Yes, cancel</button>
          </>}
        >
          <p>Booking <strong>{cancelTarget.id}</strong> will be cancelled. Cancellations up to 24 hours before pickup are fully refunded.</p>
        </Modal>
      )}
    </div>
  );
}
