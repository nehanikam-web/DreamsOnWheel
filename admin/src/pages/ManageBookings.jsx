import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, CheckCheck, Eye, KeyRound, Search, X } from 'lucide-react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { formatDate, inr } from '../utils/pricing';
import { priceForBooking } from '../utils/bookingHelpers';

const STATUSES = ['All', 'Pending', 'Approved', 'Active', 'Completed', 'Cancelled'];

function BookingDetail({ booking, onClose }) {
  const { getCar, customers, drivers, assignDriver, settings, notify } = useApp();
  const car = getCar(booking.carId);
  const cust = customers.find((c) => c.id === booking.customerId || c.email === booking.email);
  const price = priceForBooking(booking, car, settings.gstRate);
  const openStatus = ['Pending', 'Approved', 'Active'].includes(booking.status);
  const pickable = drivers.filter((d) => d.available || d.id === booking.driverId);
  const assigned = drivers.find((d) => d.id === booking.driverId);

  return (
    <Modal wide title={`Booking ${booking.id}`} onClose={onClose} footer={<button className="btn btn-dark" onClick={onClose}>Close</button>}>
      <div className="equal-col">
        <div>
          <h3 style={{ marginBottom: 10 }}>Customer</h3>
          <dl className="detail-list">
            <dt>Name</dt><dd>{booking.name || cust?.name || '-'}</dd>
            <dt>Email</dt><dd>{booking.email || cust?.email || '-'}</dd>
            <dt>Phone</dt><dd>{booking.phone || cust?.phone || '-'}</dd>
            <dt>Licence</dt><dd>{booking.licence || cust?.licence || '-'}</dd>
          </dl>
        </div>
        <div>
          <h3 style={{ marginBottom: 10 }}>Car</h3>
          <dl className="detail-list">
            <dt>Car</dt><dd>{car ? `${car.brand} ${car.name}` : 'Removed from fleet'}</dd>
            <dt>Type</dt><dd>{car ? `${car.type}, ${car.fuel}, ${car.transmission}` : '-'}</dd>
            <dt>Rental</dt><dd>{booking.mode === 'driver' ? 'With driver' : 'Self drive'}</dd>
            <dt>Status</dt><dd><StatusBadge status={booking.status} /></dd>
          </dl>
        </div>
      </div>

      <h3 style={{ margin: '20px 0 10px' }}>Trip</h3>
      <dl className="detail-list">
        <dt>Pickup</dt><dd>{formatDate(booking.pickupDate)}, {booking.pickupTime} · {booking.pickupLocation}</dd>
        <dt>Return</dt><dd>{formatDate(booking.returnDate)}, {booking.returnTime} · {booking.returnLocation}</dd>
        {booking.notes && <><dt>Requests</dt><dd>{booking.notes}</dd></>}
        {booking.coupon && <><dt>Coupon</dt><dd>{booking.coupon}</dd></>}
        {price && <><dt>Total amount</dt><dd>{inr(booking.status === 'Cancelled' ? 0 : booking.amount || price.total)}</dd></>}
      </dl>

      {booking.mode === 'driver' && (
        <>
          <h3 style={{ margin: '20px 0 10px' }}>Driver</h3>
          {openStatus ? (
            <select
              value={booking.driverId || ''}
              onChange={async (e) => { const v = e.target.value; const res = await assignDriver(booking.id, v); notify(res.ok ? (v ? 'Driver assigned' : 'Driver removed') : res.error, res.ok ? 'success' : 'error'); }}
              aria-label="Assign driver"
            >
              <option value="">Not assigned</option>
              {pickable.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.experience} yrs){d.id === booking.driverId ? ' - assigned' : ''}</option>)}
            </select>
          ) : (
            <p>{assigned ? `${assigned.name} (${assigned.phone})` : 'No driver was assigned.'}</p>
          )}
        </>
      )}
    </Modal>
  );
}

export default function ManageBookings() {
  const { bookings, getCar, customers, setBookingStatus, notify } = useApp();
  const [params, setParams] = useSearchParams();
  const status = STATUSES.includes(params.get('status')) ? params.get('status') : 'All';
  const [q, setQ] = useState('');
  const [view, setView] = useState(null);
  const [confirm, setConfirm] = useState(null); // { booking, status }

  const sorted = useMemo(() => [...bookings].sort((a, b) => b.pickupDate.localeCompare(a.pickupDate) || b.id.localeCompare(a.id)), [bookings]);
  const list = sorted.filter((b) => {
    if (status !== 'All' && b.status !== status) return false;
    const s = q.trim().toLowerCase();
    if (!s) return true;
    const car = getCar(b.carId);
    const cust = customers.find((c) => c.id === b.customerId || c.email === b.email);
    return `${b.id} ${b.name || cust?.name || ''} ${car?.brand || ''} ${car?.name || ''}`.toLowerCase().includes(s);
  });
  const counts = Object.fromEntries(STATUSES.map((s) => [s, s === 'All' ? bookings.length : bookings.filter((b) => b.status === s).length]));

  const change = async (booking, next) => {
    const res = await setBookingStatus(booking.id, next);
    notify(res.ok ? `Booking ${booking.id} marked ${next.toLowerCase()}` : res.error, res.ok ? 'success' : 'error');
    setConfirm(null);
  };

  // keep the open detail modal in sync with changes
  const liveView = view ? bookings.find((b) => b.id === view.id) : null;

  return (
    <>
      <div className="tabs">
        {STATUSES.map((s) => (
          <button key={s} className={status === s ? 'on' : ''} onClick={() => setParams(s === 'All' ? {} : { status: s })}>{s} ({counts[s]})</button>
        ))}
      </div>
      <div className="toolbar">
        <div className="search-input">
          <Search size={16} />
          <input type="search" placeholder="Search by booking ID, customer or car" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
        </div>
      </div>

      <div className="card">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Booking</th><th>Customer</th><th>Car</th><th>Pickup</th><th>Return</th><th>Type</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((b) => {
                const car = getCar(b.carId);
                const cust = customers.find((c) => c.id === b.customerId || c.email === b.email);
                return (
                  <tr key={b.id}>
                    <td><strong>{b.id}</strong></td>
                    <td>{b.name || cust?.name || '-'}<br /><span className="muted">{b.phone || cust?.phone}</span></td>
                    <td>{car ? `${car.brand} ${car.name}` : 'Removed'}</td>
                    <td>{formatDate(b.pickupDate)}</td>
                    <td>{formatDate(b.returnDate)}</td>
                    <td>{b.mode === 'driver' ? 'With driver' : 'Self drive'}</td>
                    <td>{b.status === 'Cancelled' ? '-' : inr(b.amount)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div className="row-actions">
                        <button className="mini-btn" onClick={() => setView(b)}><Eye size={13} /> View</button>
                        {b.status === 'Pending' && <button className="mini-btn ok" onClick={() => change(b, 'Approved')}><Check size={13} /> Approve</button>}
                        {b.status === 'Approved' && <button className="mini-btn" onClick={() => change(b, 'Active')}><KeyRound size={13} /> Start</button>}
                        {['Approved', 'Active'].includes(b.status) && <button className="mini-btn ok" onClick={() => setConfirm({ booking: b, status: 'Completed' })}><CheckCheck size={13} /> Complete</button>}
                        {['Pending', 'Approved', 'Active'].includes(b.status) && <button className="mini-btn bad" onClick={() => setConfirm({ booking: b, status: 'Cancelled' })}><X size={13} /> Cancel</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && <tr><td colSpan={9} className="muted" style={{ textAlign: 'center', padding: 32 }}>No bookings match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {liveView && <BookingDetail booking={liveView} onClose={() => setView(null)} />}

      {confirm && (
        <Modal
          title={`${confirm.status === 'Cancelled' ? 'Cancel' : 'Complete'} booking?`}
          onClose={() => setConfirm(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setConfirm(null)}>Go back</button>
            <button className={`btn ${confirm.status === 'Cancelled' ? 'btn-danger' : 'btn-primary'}`} onClick={() => change(confirm.booking, confirm.status)}>
              Yes, mark {confirm.status.toLowerCase()}
            </button>
          </>}
        >
          <p>Booking <strong>{confirm.booking.id}</strong> will be marked <strong>{confirm.status.toLowerCase()}</strong> and the customer will be notified.</p>
        </Modal>
      )}
    </>
  );
}
