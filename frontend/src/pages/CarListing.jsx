import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, GitCompare, Search, SlidersHorizontal, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CarCard from '../components/CarCard';
import { useApp } from '../context/AppContext';
import { BRANDS, CAR_TYPES, FUEL_TYPES, TRANSMISSIONS } from '../data/cars';
import { inr } from '../utils/pricing';

const MAX_PRICE = 25000;
const EMPTY = { brands: [], fuels: [], transmissions: [], types: [], maxPrice: MAX_PRICE, q: '', sort: 'popular', onlyAvailable: false };

function CheckGroup({ title, options, selected, onToggle }) {
  return (
    <div className="filter-group">
      <span className="field-label">{title}</span>
      <div className="checks">
        {options.map((o) => (
          <label className="check" key={o}>
            <input type="checkbox" checked={selected.includes(o)} onChange={() => onToggle(o)} /> {o}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function CarListing() {
  const { cars, compare, isRangeFree, isCurrentlyRented } = useApp();
  const [params] = useSearchParams();

  const pickup = params.get('pickup') || '';
  const ret = params.get('ret') || '';
  const location = params.get('location') || '';
  const hasDates = Boolean(pickup && ret);

  const [f, setF] = useState({ ...EMPTY, types: params.get('type') ? [params.get('type')] : [] });
  const [drawer, setDrawer] = useState(false);

  const toggle = (key) => (value) =>
    setF((s) => ({ ...s, [key]: s[key].includes(value) ? s[key].filter((x) => x !== value) : [...s[key], value] }));

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    let list = cars.filter((c) => {
      if (f.brands.length && !f.brands.includes(c.brand)) return false;
      if (f.fuels.length && !f.fuels.includes(c.fuel)) return false;
      if (f.transmissions.length && !f.transmissions.includes(c.transmission)) return false;
      if (f.types.length && !f.types.includes(c.type)) return false;
      if (c.price > f.maxPrice) return false;
      if (q && !`${c.brand} ${c.name}`.toLowerCase().includes(q)) return false;
      const free = c.available && !isCurrentlyRented(c.id) && (!hasDates || isRangeFree(c.id, pickup, ret));
      if ((f.onlyAvailable || hasDates) && !free) return false;
      return true;
    });
    const sorters = {
      popular: (a, b) => b.rating * b.reviews - a.rating * a.reviews,
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
    };
    list = [...list].sort(sorters[f.sort]);
    return list;
  }, [cars, f, hasDates, pickup, ret, isRangeFree, isCurrentlyRented]);

  const chips = [
    ...f.brands.map((v) => ({ key: 'brands', v })),
    ...f.types.map((v) => ({ key: 'types', v })),
    ...f.fuels.map((v) => ({ key: 'fuels', v })),
    ...f.transmissions.map((v) => ({ key: 'transmissions', v })),
  ];
  const filtersActive = chips.length > 0 || f.maxPrice < MAX_PRICE || f.q || f.onlyAvailable;

  // dates picked on the home page travel with the car links
  const carry = hasDates ? `?${new URLSearchParams({ pickup, ret, ...(location && { location }) }).toString()}` : '';

  return (
    <>
      <PageHeader title="Explore Cars" subtitle="Browse our full fleet and filter by brand, price, fuel, transmission and type." crumbs={[{ label: 'Explore Cars' }]} />

      <div className="container listing">
        <aside className={`filters ${drawer ? 'open' : ''}`} aria-label="Filters">
          <h3>
            <span><SlidersHorizontal size={16} style={{ verticalAlign: -2 }} /> Filters</span>
            <span style={{ display: 'flex', gap: 6 }}>
              {filtersActive && <button className="btn btn-ghost btn-sm" onClick={() => setF({ ...EMPTY })}>Clear all</button>}
              <button className="icon-btn filter-toggle" onClick={() => setDrawer(false)} aria-label="Close filters"><X size={18} /></button>
            </span>
          </h3>

          <div className="filter-group">
            <span className="field-label">Max price per day</span>
            <input type="range" min={1000} max={MAX_PRICE} step={500} value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: Number(e.target.value) })} aria-label="Maximum price per day" />
            <div className="range-labels"><span>{inr(1000)}</span><strong>{inr(f.maxPrice)}</strong></div>
          </div>

          <label className="check">
            <input type="checkbox" checked={f.onlyAvailable} onChange={(e) => setF({ ...f, onlyAvailable: e.target.checked })} /> Available cars only
          </label>

          <CheckGroup title="Brand" options={BRANDS} selected={f.brands} onToggle={toggle('brands')} />
          <CheckGroup title="Car Type" options={CAR_TYPES} selected={f.types} onToggle={toggle('types')} />
          <CheckGroup title="Fuel Type" options={FUEL_TYPES} selected={f.fuels} onToggle={toggle('fuels')} />
          <CheckGroup title="Transmission" options={TRANSMISSIONS} selected={f.transmissions} onToggle={toggle('transmissions')} />

          <button className="btn btn-dark filter-toggle" onClick={() => setDrawer(false)}>Show {results.length} cars</button>
        </aside>

        <section>
          {hasDates && (
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              Showing cars free from <strong>{pickup}</strong> to <strong>{ret}</strong>{location && <> for pickup at <strong>{location}</strong></>}.{' '}
              <Link to="/cars" className="link">Clear dates</Link>
            </div>
          )}

          <div className="list-toolbar">
            <div className="search-input">
              <Search size={16} />
              <input type="search" placeholder="Search by car name or brand" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} aria-label="Search cars" />
            </div>
            <button className="btn btn-outline filter-toggle" onClick={() => setDrawer(true)}><Filter size={16} /> Filters</button>
            <select value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })} aria-label="Sort cars">
              <option value="popular">Sort: Popular</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>

          {chips.length > 0 && (
            <div className="active-filters">
              {chips.map(({ key, v }) => (
                <span className="pill" key={key + v}>{v}<button onClick={() => toggle(key)(v)} aria-label={`Remove ${v}`}><X size={13} /></button></span>
              ))}
            </div>
          )}

          <p className="result-count">Showing {results.length} of {cars.length} cars</p>

          {results.length === 0 ? (
            <div className="empty">
              <h3>No cars match your filters</h3>
              <p>Try removing a filter or increasing the maximum price.</p>
              <button className="btn btn-outline mt" onClick={() => setF({ ...EMPTY })}>Reset filters</button>
            </div>
          ) : (
            <div className="car-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
              {results.map((c) => <CarCard key={c.id} car={c} query={carry} />)}
            </div>
          )}
        </section>
      </div>

      {compare.length > 0 && (
        <div className="compare-bar">
          <div className="container">
            <span><GitCompare size={16} style={{ verticalAlign: -3 }} /> {compare.length} car{compare.length > 1 ? 's' : ''} selected for comparison (max 3)</span>
            <Link to="/compare" className="btn btn-primary btn-sm">Compare now</Link>
          </div>
        </div>
      )}
    </>
  );
}
