import { Link } from 'react-router-dom';
import { CalendarCheck, Car, CheckCircle2, IndianRupee, KeyRound, Users } from 'lucide-react';
import BarChart from './BarChart';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { formatDate, inr } from '../utils/pricing';

const compactInr = (v) => '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : Math.round(v / 1000) + 'k');

export default function AdminDashboard() {
  const { cars, bookings, customers, getCar, isCurrentlyRented, monthlyStats } = useApp();

  const rented = cars.filter((c) => isCurrentlyRented(c.id)).length;
  const available = cars.filter((c) => c.available && !isCurrentlyRented(c.id)).length;
  const revenue = bookings.filter((b) => ['Completed', 'Active', 'Approved'].includes(b.status)).reduce((s, b) => s + (b.amount || 0), 0);
  const pending = bookings.filter((b) => b.status === 'Pending').length;
  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)).slice(0, 6);

  const kpis = [
    { label: 'Total Cars', value: cars.length, icon: Car },
    { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck },
    { label: 'Available Cars', value: available, icon: CheckCircle2 },
    { label: 'Rented Cars', value: rented, icon: KeyRound },
    { label: 'Total Customers', value: customers.length, icon: Users },
    { label: 'Booking Revenue', value: inr(revenue), icon: IndianRupee },
  ];

  return (
    <>
      {pending > 0 && (
        <div className="alert alert-warn">
          {pending} booking{pending > 1 ? 's are' : ' is'} waiting for approval. <Link to="/bookings?status=Pending" className="link">Review now</Link>
        </div>
      )}

      <div className="kpi-grid">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="kpi-icon"><k.icon size={22} /></div>
            <div><small>{k.label}</small><strong>{k.value}</strong></div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head"><h3>Revenue overview</h3><span className="muted" style={{ fontSize: '0.8rem' }}>Last 12 months</span></div>
          <div className="card-body"><BarChart data={monthlyStats} valueKey="revenue" format={compactInr} /></div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Fleet status</h3></div>
          <div className="card-body stack-sm">
            <div className="row-between"><span>Available</span><strong>{available}</strong></div>
            <div className="row-between"><span>Rented now</span><strong>{rented}</strong></div>
            <div className="row-between"><span>Switched off</span><strong>{cars.filter((c) => !c.available && !isCurrentlyRented(c.id)).length}</strong></div>
            <div className="h-track" style={{ height: 12, display: 'flex' }}>
              <div style={{ width: `${cars.length ? (available / cars.length) * 100 : 0}%`, background: 'var(--ok)' }} />
              <div style={{ width: `${cars.length ? (rented / cars.length) * 100 : 0}%`, background: 'var(--orange)' }} />
            </div>
            <span className="muted" style={{ fontSize: '0.8rem' }}>Green: available · Orange: rented</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Recent bookings</h3><Link to="/bookings" className="btn btn-outline btn-sm">View all</Link></div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Booking</th><th>Customer</th><th>Car</th><th>Dates</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map((b) => {
                const car = getCar(b.carId);
                const cust = customers.find((c) => c.id === b.customerId || c.email === b.email);
                return (
                  <tr key={b.id}>
                    <td><strong>{b.id}</strong></td>
                    <td>{b.name || cust?.name || '-'}</td>
                    <td>{car ? `${car.brand} ${car.name}` : 'Removed'}</td>
                    <td>{formatDate(b.pickupDate)} - {formatDate(b.returnDate)}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
