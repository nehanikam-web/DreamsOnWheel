import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { formatDate, inr } from '../utils/pricing';

function CustomerModal({ customer, onClose }) {
  const { bookingsForEmail, getCar } = useApp();
  const history = bookingsForEmail(customer.email).sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));
  const spent = history.filter((b) => b.status !== 'Cancelled').reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <Modal wide title={customer.name} onClose={onClose} footer={<button className="btn btn-dark" onClick={onClose}>Close</button>}>
      <h3 style={{ marginBottom: 10 }}>Customer information</h3>
      <dl className="detail-list">
        <dt>Customer ID</dt><dd>{customer.id}</dd>
        <dt>Email</dt><dd>{customer.email}</dd>
        <dt>Phone</dt><dd>{customer.phone || '-'}</dd>
        <dt>City</dt><dd>{customer.city || '-'}</dd>
        <dt>Driving licence</dt><dd>{customer.licence || '-'}</dd>
        <dt>Member since</dt><dd>{formatDate(customer.joined)}</dd>
        <dt>Total bookings</dt><dd>{history.length}</dd>
        <dt>Total spent</dt><dd>{inr(spent)}</dd>
      </dl>

      <h3 style={{ margin: '22px 0 10px' }}>Booking history</h3>
      {history.length === 0 ? <p className="muted">No bookings yet.</p> : (
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 520 }}>
            <thead><tr><th>Booking</th><th>Car</th><th>Dates</th><th>Status</th></tr></thead>
            <tbody>
              {history.map((b) => {
                const car = getCar(b.carId);
                return (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{car ? `${car.brand} ${car.name}` : 'Removed'}</td>
                    <td>{formatDate(b.pickupDate)} - {formatDate(b.returnDate)}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export default function ManageCustomers() {
  const { customers, bookingsForEmail } = useApp();
  const [q, setQ] = useState('');
  const [view, setView] = useState(null);

  const s = q.trim().toLowerCase();
  const list = customers.filter((c) => !s || `${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase().includes(s));

  return (
    <>
      <div className="toolbar">
        <div className="search-input">
          <Search size={16} />
          <input type="search" placeholder="Search by name, email, phone or city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
        </div>
      </div>
      <div className="card">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>City</th><th>Joined</th><th>Bookings</th><th>Status</th><th /></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id + c.email}>
                  <td><strong>{c.name}</strong><br /><span className="muted">{c.id}</span></td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.city}</td>
                  <td>{formatDate(c.joined)}</td>
                  <td>{bookingsForEmail(c.email).length}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><button className="mini-btn" onClick={() => setView(c)}><Eye size={13} /> View</button></td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 32 }}>No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {view && <CustomerModal customer={view} onClose={() => setView(null)} />}
    </>
  );
}
