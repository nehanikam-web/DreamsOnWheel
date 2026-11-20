import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import CarImage from '../components/CarImage';
import Field from '../components/Field';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { BRANDS, CAR_TYPES, FUEL_TYPES, TRANSMISSIONS } from '../data/cars';
import { inr } from '../utils/pricing';
import { validateCar } from '../utils/validators';
import { uploadCarImage } from '../services/carService';

const BLANK = {
  name: '', brand: '', type: 'Hatchback', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: '',
  mileage: '', engine: '', power: '', luggage: '', year: 2024, available: true, image: '', features: '',
};

function CarForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [imgError, setImgError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError('');
    setUploading(true);
    const res = await uploadCarImage(file); // stored on the server, the car keeps only the URL
    setUploading(false);
    if (!res.ok) return setImgError(res.error);
    setF({ ...f, image: res.data.url });
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validateCar(f);
    setErrors(v);
    if (Object.keys(v).length) return;
    setFormError('');
    setSaving(true);
    const res = await onSave(f);
    setSaving(false);
    if (res && !res.ok) setFormError(res.error);
  };

  return (
    <Modal
      wide
      title={initial.id ? 'Edit car' : 'Add new car'}
      onClose={onClose}
      footer={<>
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" form="car-form" className="btn btn-primary" disabled={saving || uploading}>{saving ? 'Saving...' : initial.id ? 'Save changes' : 'Add car'}</button>
      </>}
    >
      <form id="car-form" onSubmit={submit} noValidate>
        {formError && <div className="alert alert-error" role="alert" style={{ marginBottom: 14 }}>{formError}</div>}
        <div className="form-grid">
          <Field label="Car name and model" error={errors.name} className="full"><input type="text" placeholder="e.g. Creta SX" value={f.name} onChange={set('name')} /></Field>
          <Field label="Brand" error={errors.brand}>
            <select value={f.brand} onChange={set('brand')}><option value="">Select brand</option>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select>
          </Field>
          <Field label="Car type"><select value={f.type} onChange={set('type')}>{CAR_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Fuel type"><select value={f.fuel} onChange={set('fuel')}>{FUEL_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Transmission"><select value={f.transmission} onChange={set('transmission')}>{TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Price per day (₹)" error={errors.price}><input type="number" min="0" value={f.price} onChange={set('price')} /></Field>
          <Field label="Seating capacity" error={errors.seats}><input type="number" min="2" max="12" value={f.seats} onChange={set('seats')} /></Field>
          <Field label="Mileage / range" error={errors.mileage}><input type="text" placeholder="e.g. 18 km/l" value={f.mileage} onChange={set('mileage')} /></Field>
          <Field label="Engine"><input type="text" placeholder="e.g. 1497 cc" value={f.engine} onChange={set('engine')} /></Field>
          <Field label="Power"><input type="text" placeholder="e.g. 115 hp" value={f.power} onChange={set('power')} /></Field>
          <Field label="Boot space"><input type="text" placeholder="e.g. 433 L" value={f.luggage} onChange={set('luggage')} /></Field>
          <Field label="Extra features (comma separated)" className="full"><input type="text" placeholder="Sunroof, Rear Camera, Cruise Control" value={f.features} onChange={set('features')} /></Field>
          <div className="full">
            <span className="field-label" style={{ display: 'block', marginBottom: 6 }}>Car image</span>
            {f.image && <img className="upload-preview" src={f.image} alt="Preview" />}
            <label className="upload-box">
              <Upload size={20} style={{ verticalAlign: -5, marginRight: 6 }} />
              {f.image ? 'Replace image' : 'Click to upload an image'} (JPG or PNG)
              <input type="file" accept="image/*" onChange={pickImage} />
            </label>
            {uploading && <span className="muted" style={{ fontSize: '0.82rem' }}>Uploading...</span>}
            {imgError && <span className="field-error">{imgError}</span>}
            <span className="field-hint">Images are resized and kept in this browser only.</span>
          </div>
          <label className="check full">
            <input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} /> Available for booking
          </label>
        </div>
      </form>
    </Modal>
  );
}

export default function ManageCars() {
  const { cars, addCar, updateCar, deleteCar, isCurrentlyRented, notify } = useApp();
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [editing, setEditing] = useState(null); // car form values or null
  const [toDelete, setToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const PER = 10;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return cars.filter((c) => (!brand || c.brand === brand) && (!s || `${c.brand} ${c.name}`.toLowerCase().includes(s)));
  }, [cars, q, brand]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const current = Math.min(page, pages);
  const slice = list.slice((current - 1) * PER, current * PER);

  const openEdit = (c) => setEditing({ ...BLANK, ...c, image: c.images?.[0] || '', features: (c.features || []).slice(6).join(', ') });

  const save = async (f) => {
    const extra = f.features.split(',').map((x) => x.trim()).filter(Boolean);
    const base = ['Air Conditioning', 'Power Steering', 'Bluetooth Audio', 'USB Charging', 'ABS with EBD', 'Dual Airbags'];
    const image = f.image || `https://loremflickr.com/900/600/${encodeURIComponent(f.brand.split(' ')[0].toLowerCase())},car?lock=${Date.now() % 1000}`;
    const existing = f.id ? cars.find((c) => c.id === f.id) : null;
    const keepGallery = existing && f.image === existing.images[0];
    const data = {
      name: f.name.trim(), brand: f.brand, type: f.type, fuel: f.fuel, transmission: f.transmission,
      seats: Number(f.seats), price: Number(f.price), mileage: f.mileage.trim(), engine: f.engine.trim() || '-',
      power: f.power.trim() || '-', luggage: f.luggage.trim() || '-', available: f.available,
      images: keepGallery ? existing.images : [image], features: [...base, ...extra],
    };
    const res = f.id ? await updateCar(f.id, data) : await addCar(data);
    if (!res.ok) return res; // the form shows the server message and stays open
    notify(f.id ? 'Car updated' : 'Car added to the fleet');
    setEditing(null);
    return res;
  };

  const confirmDelete = async () => {
    const res = await deleteCar(toDelete.id);
    notify(res.ok ? `${toDelete.brand} ${toDelete.name} deleted` : res.error, res.ok ? 'success' : 'error');
    setToDelete(null);
  };

  return (
    <>
      <div className="toolbar">
        <div className="search-input">
          <Search size={16} />
          <input type="search" placeholder="Search cars" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search cars" />
        </div>
        <select value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }} aria-label="Filter by brand">
          <option value="">All brands</option>{BRANDS.map((b) => <option key={b}>{b}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setEditing({ ...BLANK })}><Plus size={16} /> Add New Car</button>
      </div>

      <div className="card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>Car</th><th>Type</th><th>Fuel</th><th>Transmission</th><th>Price / day</th><th>Status</th><th>Available</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {slice.map((c) => {
                const rented = isCurrentlyRented(c.id);
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="cell-car">
                        <CarImage src={c.images[0]} alt={c.name} />
                        <div><strong>{c.name}</strong><br /><span className="muted">{c.brand}</span></div>
                      </div>
                    </td>
                    <td>{c.type}</td>
                    <td>{c.fuel}</td>
                    <td>{c.transmission}</td>
                    <td>
                      <input
                        type="number" min="0" step="100" defaultValue={c.price} key={c.price}
                        style={{ width: 100, padding: '6px 8px' }} aria-label={`Price for ${c.name}`}
                        onBlur={async (e) => {
                          const v = Number(e.target.value);
                          if (v > 0 && v !== c.price) {
                            const res = await updateCar(c.id, { price: v });
                            notify(res.ok ? `Price updated to ${inr(v)}` : res.error, res.ok ? 'success' : 'error');
                          } else e.target.value = c.price;
                        }}
                      />
                    </td>
                    <td><StatusBadge status={rented ? 'Rented' : c.available ? 'Available' : 'Unavailable'} /></td>
                    <td>
                      <label className="switch" title="Toggle availability">
                        <input type="checkbox" checked={c.available} onChange={async (e) => { const on = e.target.checked; const res = await updateCar(c.id, { available: on }); notify(res.ok ? (on ? 'Marked available' : 'Marked unavailable') : res.error, res.ok ? 'success' : 'error'); }} aria-label={`Availability of ${c.name}`} />
                        <i />
                      </label>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="mini-btn" onClick={() => openEdit(c)}><Pencil size={13} /> Edit</button>
                        <button className="mini-btn bad" onClick={() => setToDelete(c)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {slice.length === 0 && <tr><td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 32 }}>No cars found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card-head" style={{ borderTop: '1px solid var(--border)', borderBottom: 0 }}>
          <span className="muted">{list.length} cars</span>
          <div className="row-actions">
            <button className="mini-btn" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button>
            <span style={{ padding: '5px 8px', fontSize: '0.85rem' }}>Page {current} of {pages}</span>
            <button className="mini-btn" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button>
          </div>
        </div>
      </div>

      {editing && <CarForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}

      {toDelete && (
        <Modal
          title="Delete this car?"
          onClose={() => setToDelete(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setToDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete car</button>
          </>}
        >
          <p><strong>{toDelete.brand} {toDelete.name}</strong> will be removed from the fleet. Existing bookings for it stay in the records.</p>
        </Modal>
      )}
    </>
  );
}
