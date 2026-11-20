import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CarImage from '../components/CarImage';
import Rating from '../components/Rating';
import { useApp } from '../context/AppContext';
import { inr } from '../utils/pricing';

export default function Compare() {
  const { compare, getCar, toggleCompare, setCompare, isCurrentlyRented } = useApp();
  const items = compare.map(getCar).filter(Boolean);
  const cheapest = items.length ? Math.min(...items.map((c) => c.price)) : 0;
  const bestRating = items.length ? Math.max(...items.map((c) => c.rating)) : 0;

  const rows = [
    ['Brand', (c) => c.brand],
    ['Car type', (c) => c.type],
    ['Price per day', (c) => <span className={c.price === cheapest && items.length > 1 ? 'best' : ''}>{inr(c.price)}</span>],
    ['Rating', (c) => <span className={c.rating === bestRating && items.length > 1 ? 'best' : ''}><Rating value={c.rating} count={c.reviews} /></span>],
    ['Fuel type', (c) => c.fuel],
    ['Transmission', (c) => c.transmission],
    ['Mileage', (c) => c.mileage],
    ['Seating', (c) => `${c.seats} persons`],
    ['Engine', (c) => c.engine],
    ['Power', (c) => c.power],
    ['Boot space', (c) => c.luggage],
    ['Availability', (c) => (c.available && !isCurrentlyRented(c.id) ? 'Available' : 'Rented')],
  ];

  return (
    <>
      <PageHeader title="Compare Cars" subtitle="Compare up to three cars side by side." crumbs={[{ label: 'Compare' }]} />
      <div className="container" style={{ padding: '32px 20px 64px' }}>
        {items.length === 0 ? (
          <div className="empty">
            <h3>No cars selected</h3>
            <p>Use the compare icon on any car card to add up to three cars here.</p>
            <Link to="/cars" className="btn btn-primary mt">Explore cars</Link>
          </div>
        ) : (
          <>
            <div className="row-between" style={{ marginBottom: 14 }}>
              <span className="muted">{items.length} of 3 cars selected</span>
              <button className="btn btn-outline btn-sm" onClick={() => setCompare([])}>Clear all</button>
            </div>
            <div className="table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th />
                    {items.map((c) => (
                      <td key={c.id}>
                        <CarImage src={c.images[0]} alt={`${c.brand} ${c.name}`} />
                        <div className="row-between" style={{ alignItems: 'flex-start' }}>
                          <div><span className="brand">{c.brand}</span><h3>{c.name}</h3></div>
                          <button className="icon-btn" onClick={() => toggleCompare(c.id)} aria-label={`Remove ${c.name}`}><X size={16} /></button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, render]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {items.map((c) => <td key={c.id}>{render(c)}</td>)}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Actions</th>
                    {items.map((c) => (
                      <td key={c.id}>
                        <div className="btn-pair">
                          <Link to={`/cars/${c.id}`} className="btn btn-outline btn-sm">Details</Link>
                          <Link to={`/book/${c.id}`} className="btn btn-primary btn-sm">Book Now</Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            {items.length < 3 && <p className="muted" style={{ marginTop: 14 }}><Link to="/cars" className="link">Add another car</Link> to compare.</p>}
          </>
        )}
      </div>
    </>
  );
}
