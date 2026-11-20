import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, GitCompare, Heart } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CarImage from '../components/CarImage';
import CarCard from '../components/CarCard';
import QuickBookCard from '../components/QuickBookCard';
import Rating, { Stars } from '../components/Rating';
import Field from '../components/Field';
import { useApp } from '../context/AppContext';
import { DEPOSIT_BY_TYPE, DRIVER_RATE_BY_TYPE } from '../data/cars';
import { formatDate, inr } from '../utils/pricing';

function Reviews({ car }) {
  const { reviews, addReview, user, notify } = useApp();
  const list = reviews.filter((r) => r.carId === car.id);
  const [form, setForm] = useState({ rating: 5, text: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (form.text.trim().length < 10) return setError('Please write at least 10 characters.');
    const res = await addReview({ carId: car.id, rating: form.rating, text: form.text.trim() });
    if (!res.ok) return setError(res.error);
    setForm({ rating: 5, text: '' });
    setError('');
    notify('Thanks, your review has been added');
  };

  return (
    <div className="panel">
      <h3>Customer reviews ({list.length})</h3>
      {list.length === 0 && <p className="muted">No reviews for this car yet.</p>}
      {list.map((r) => (
        <div className="review" key={r.id}>
          <div className="review-head">
            <strong>{r.name}</strong>
            <span className="muted" style={{ fontSize: '0.8rem' }}>{formatDate(r.date)}</span>
          </div>
          <Stars value={r.rating} size={14} />
          <p style={{ marginTop: 6, color: 'var(--text-2)' }}>{r.text}</p>
        </div>
      ))}

      <form onSubmit={submit} className="stack" style={{ marginTop: 18 }} noValidate>
        <strong>Write a review</strong>
        {user ? (
          <>
            <div className="rate-input" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} className={n <= form.rating ? 'on' : ''} onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} star`}>
                  <Stars value={n <= form.rating ? 1 : 0} size={22} />
                </button>
              ))}
            </div>
            <Field error={error}>
              <textarea placeholder="Share your experience with this car" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
            </Field>
            <button className="btn btn-dark" style={{ alignSelf: 'flex-start' }}>Submit review</button>
          </>
        ) : (
          <p className="muted"><Link to="/login" className="link" state={{ from: `/cars/${car.id}` }}>Log in</Link> to write a review.</p>
        )}
      </form>
    </div>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const { cars, getCar, addRecent, wishlist, toggleWishlist, compare, toggleCompare, bookedRanges, isCurrentlyRented, recent } = useApp();
  const car = getCar(id);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (car) addRecent(car.id);
    setActive(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!car) {
    return (
      <div className="notfound">
        <h1>Car not found</h1>
        <p>This car may have been removed from the fleet.</p>
        <Link to="/cars" className="btn btn-primary">Back to all cars</Link>
      </div>
    );
  }

  const available = car.available && !isCurrentlyRented(car.id);
  const ranges = bookedRanges(car.id);
  const similar = cars.filter((c) => c.id !== car.id && c.type === car.type && c.available).slice(0, 3);
  const recentOthers = recent.filter((r) => r !== car.id).map(getCar).filter(Boolean).slice(0, 3);

  const specs = [
    ['Brand', car.brand], ['Type', car.type], ['Fuel type', car.fuel],
    ['Mileage', car.mileage], ['Transmission', car.transmission], ['Seating', `${car.seats} persons`],
    ['Engine', car.engine], ['Power', car.power], ['Boot space', car.luggage],
    ['Model year', car.year], ['Driver charges', `${inr(DRIVER_RATE_BY_TYPE[car.type])} / day`], ['Security deposit', inr(DEPOSIT_BY_TYPE[car.type])],
  ];

  return (
    <>
      <PageHeader title={`${car.brand} ${car.name}`} crumbs={[{ label: 'Explore Cars', to: '/cars' }, { label: car.name }]} />

      <div className="container details">
        <div>
          <div className="gallery-main"><CarImage src={car.images[active]} alt={`${car.brand} ${car.name}`} /></div>
          <div className="gallery-thumbs">
            {car.images.map((src, i) => (
              <button key={src} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}>
                <CarImage src={src} alt={`${car.name} photo ${i + 1}`} />
              </button>
            ))}
          </div>

          <div className="row-between details-title">
            <div className="details-meta">
              <Rating value={car.rating} count={car.reviews} size={16} />
              <span className={`badge ${available ? 'badge-ok' : 'badge-bad'}`}>{available ? 'Available' : 'Currently rented'}</span>
              <span className="badge badge-muted">{car.type}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`btn btn-outline btn-sm`} onClick={() => toggleWishlist(car.id)}>
                <Heart size={15} fill={wishlist.includes(car.id) ? 'currentColor' : 'none'} /> {wishlist.includes(car.id) ? 'Saved' : 'Save'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => toggleCompare(car.id)}>
                <GitCompare size={15} /> {compare.includes(car.id) ? 'In comparison' : 'Compare'}
              </button>
            </div>
          </div>

          <div className="panel mt">
            <h3>Specifications</h3>
            <div className="spec-grid">
              {specs.map(([k, v]) => <div className="spec" key={k}><small>{k}</small><strong>{v}</strong></div>)}
            </div>
          </div>

          <div className="panel">
            <h3>Features and facilities</h3>
            <ul className="feature-list">
              {car.features.map((f) => <li key={f}><Check size={16} /> {f}</li>)}
            </ul>
          </div>

          <div className="panel">
            <h3>Available dates</h3>
            {!car.available && <p className="alert alert-warn">This car is currently switched off for new bookings.</p>}
            {car.available && ranges.length === 0 && <p className="alert alert-ok">Free for all upcoming dates.</p>}
            {ranges.length > 0 && (
              <>
                <p className="muted" style={{ marginBottom: 8 }}>Booked periods. The car is free on all other dates.</p>
                <ul className="range-list">
                  {ranges.map((r) => (
                    <li key={r.from + r.to}><span>{formatDate(r.from)} to {formatDate(r.to)}</span><span className="badge badge-bad">Booked</span></li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <Reviews car={car} />
        </div>

        <aside><QuickBookCard key={car.id} car={car} available={available} /></aside>
      </div>

      {(similar.length > 0 || recentOthers.length > 0) && (
        <section className="section alt">
          <div className="container">
            {similar.length > 0 && (
              <>
                <h2 style={{ marginBottom: 20 }}>Similar cars</h2>
                <div className="car-grid">{similar.map((c) => <CarCard key={c.id} car={c} />)}</div>
              </>
            )}
            {recentOthers.length > 0 && (
              <>
                <h2 style={{ margin: '36px 0 20px' }}>Recently viewed</h2>
                <div className="car-grid">{recentOthers.map((c) => <CarCard key={c.id} car={c} />)}</div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
