import { Download } from 'lucide-react';
import BarChart, { HBars } from './BarChart';
import { useApp } from '../context/AppContext';
import { formatDate, inr } from '../utils/pricing';

const compactInr = (v) => '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : Math.round(v / 1000) + 'k');
const STATUSES = ['Pending', 'Approved', 'Active', 'Completed', 'Cancelled'];

export default function Reports() {
  const { bookings, cars, getCar, customers, notify, monthlyStats } = useApp();

  const counted = bookings.filter((b) => b.status !== 'Cancelled');
  const revenue = counted.reduce((s, b) => s + (b.amount || 0), 0);
  const avg = counted.length ? revenue / counted.length : 0;
  const selfCount = counted.filter((b) => b.mode === 'self').length;
  const driverCount = counted.length - selfCount;

  const byCar = {};
  counted.forEach((b) => { byCar[b.carId] = (byCar[b.carId] || 0) + 1; });
  const popular = Object.entries(byCar)
    .map(([id, value]) => ({ car: getCar(id), value }))
    .filter((r) => r.car)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map((r) => ({ label: `${r.car.brand} ${r.car.name}`, value: r.value }));

  const totalSample = monthlyStats.reduce((s, m) => s + m.revenue, 0);
  const totalSampleBookings = monthlyStats.reduce((s, m) => s + m.bookings, 0);

  const exportCsv = () => {
    const header = ['Booking ID', 'Customer', 'Car', 'Type', 'Pickup', 'Return', 'Status', 'Amount'];
    const rows = bookings.map((b) => {
      const car = getCar(b.carId);
      const cust = customers.find((c) => c.id === b.customerId || c.email === b.email);
      return [b.id, b.name || cust?.name || '', car ? `${car.brand} ${car.name}` : '', b.mode, b.pickupDate, b.returnDate, b.status, b.status === 'Cancelled' ? 0 : b.amount || 0];
    });
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dreamsonwheel-bookings-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    notify('Report downloaded');
  };

  return (
    <>
      <div className="row-between">
        <p className="muted">Figures come from live booking records. Monthly charts cover the last 12 months, grouped by pickup month.</p>
        <button className="btn btn-outline" onClick={exportCsv}><Download size={16} /> Export bookings (CSV)</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><div><small>Booking revenue (excl. cancelled)</small><strong>{inr(revenue)}</strong></div></div>
        <div className="kpi"><div><small>Average booking value</small><strong>{inr(avg)}</strong></div></div>
        <div className="kpi"><div><small>Self drive vs with driver</small><strong>{selfCount} / {driverCount}</strong></div></div>
      </div>

      <div className="equal-col">
        <div className="card">
          <div className="card-head"><h3>Booking report by status</h3></div>
          <div className="card-body">
            <HBars rows={STATUSES.map((s) => ({ label: s, value: bookings.filter((b) => b.status === s).length }))} />
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Popular cars</h3></div>
          <div className="card-body">
            {popular.length === 0 ? <p className="muted">No bookings yet.</p> : <HBars rows={popular} />}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Revenue report</h3><span className="muted" style={{ fontSize: '0.85rem' }}>Last 12 months: {inr(totalSample)}</span></div>
        <div className="card-body"><BarChart data={monthlyStats} valueKey="revenue" format={compactInr} /></div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Monthly booking statistics</h3><span className="muted" style={{ fontSize: '0.85rem' }}>Last 12 months: {totalSampleBookings} bookings</span></div>
        <div className="card-body"><BarChart data={monthlyStats} valueKey="bookings" /></div>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 480 }}>
            <thead><tr><th>Month</th><th>Bookings</th><th>Revenue</th><th>Avg. per booking</th></tr></thead>
            <tbody>
              {monthlyStats.map((m) => (
                <tr key={m.month}><td>{m.month} {m.year}</td><td>{m.bookings}</td><td>{inr(m.revenue)}</td><td>{m.bookings ? inr(m.revenue / m.bookings) : '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Booking report</h3><span className="muted" style={{ fontSize: '0.85rem' }}>{bookings.length} records · {cars.length} cars</span></div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Booking</th><th>Car</th><th>Pickup</th><th>Return</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              {[...bookings].sort((a, b) => b.pickupDate.localeCompare(a.pickupDate)).slice(0, 12).map((b) => {
                const car = getCar(b.carId);
                return (
                  <tr key={b.id}>
                    <td>{b.id}</td><td>{car ? `${car.brand} ${car.name}` : 'Removed'}</td>
                    <td>{formatDate(b.pickupDate)}</td><td>{formatDate(b.returnDate)}</td>
                    <td>{b.status}</td><td>{b.status === 'Cancelled' ? '-' : inr(b.amount)}</td>
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
