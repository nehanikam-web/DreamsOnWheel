import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Car } from 'lucide-react';
import { CAR_TYPES } from '../data/cars';
import { LOCATIONS } from '../data/seed';
import { addDays, todayISO } from '../utils/pricing';

// Home page search. Sends the chosen values to the listing page through the URL.
export default function SearchBar() {
  const navigate = useNavigate();
  const today = todayISO();
  const [f, setF] = useState({ location: '', pickup: today, ret: addDays(today, 1), type: '' });
  const [error, setError] = useState('');

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!f.location) return setError('Please select a pickup location.');
    if (f.pickup < today) return setError('Pickup date cannot be in the past.');
    if (f.ret < f.pickup) return setError('Return date must be on or after the pickup date.');
    setError('');
    const q = new URLSearchParams({ location: f.location, pickup: f.pickup, ret: f.ret });
    if (f.type) q.set('type', f.type);
    navigate(`/cars?${q.toString()}`);
  };

  return (
    <form className="search-bar" onSubmit={submit} noValidate>
      <label className="search-cell">
        <span><MapPin size={14} /> Pickup Location</span>
        <select value={f.location} onChange={set('location')}>
          <option value="">Select location</option>
          {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </label>
      <label className="search-cell">
        <span><Calendar size={14} /> Pickup Date</span>
        <input type="date" min={today} value={f.pickup} onChange={(e) => setF({ ...f, pickup: e.target.value, ret: e.target.value > f.ret ? e.target.value : f.ret })} />
      </label>
      <label className="search-cell">
        <span><Calendar size={14} /> Return Date</span>
        <input type="date" min={f.pickup} value={f.ret} onChange={set('ret')} />
      </label>
      <label className="search-cell">
        <span><Car size={14} /> Car Type</span>
        <select value={f.type} onChange={set('type')}>
          <option value="">All types</option>
          {CAR_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <button type="submit" className="btn btn-primary search-btn"><Search size={18} /> Search Cars</button>
      {error && <p className="search-error" role="alert">{error}</p>}
    </form>
  );
}
