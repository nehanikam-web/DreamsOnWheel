import { useState } from 'react';
import { Eye, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import Field from '../components/Field';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/pricing';
import { isPhone } from '../utils/validators';

const BLANK = { name: '', phone: '', experience: '', licence: '', languages: '', available: true };

function DriverForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const v = {};
    if (f.name.trim().length < 3) v.name = 'Enter the driver name.';
    if (!isPhone(f.phone)) v.phone = 'Enter a valid 10-digit mobile number.';
    if (!(Number(f.experience) >= 1 && Number(f.experience) <= 50)) v.experience = 'Experience must be between 1 and 50 years.';
    if (!f.licence.trim()) v.licence = 'Licence number is required.';
    setErrors(v);
    if (Object.keys(v).length) return;
    onSave({ ...f, name: f.name.trim(), phone: f.phone.trim(), licence: f.licence.trim(), languages: f.languages.trim(), experience: Number(f.experience) });
  };

  return (
    <Modal
      title={initial.id ? 'Edit driver' : 'Add driver'}
      onClose={onClose}
      footer={<>
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" form="driver-form" className="btn btn-primary">{initial.id ? 'Save changes' : 'Add driver'}</button>
      </>}
    >
      <form id="driver-form" className="form-grid" onSubmit={submit} noValidate>
        <Field label="Full name" error={errors.name} className="full"><input type="text" value={f.name} onChange={set('name')} /></Field>
        <Field label="Mobile number" error={errors.phone}><input type="tel" maxLength={10} value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Experience (years)" error={errors.experience}><input type="number" min="1" max="50" value={f.experience} onChange={set('experience')} /></Field>
        <Field label="Licence number" error={errors.licence}><input type="text" value={f.licence} onChange={set('licence')} /></Field>
        <Field label="Languages"><input type="text" placeholder="Marathi, Hindi, English" value={f.languages} onChange={set('languages')} /></Field>
        <label className="check full"><input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} /> Available for assignments</label>
      </form>
    </Modal>
  );
}

export default function ManageDrivers() {
  const { drivers, bookings, getCar, addDriver, updateDriver, deleteDriver, notify } = useApp();
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [viewId, setViewId] = useState(null);

  const assigned = (id) => bookings.filter((b) => b.driverId === id);
  const open = (id) => assigned(id).filter((b) => ['Pending', 'Approved', 'Active'].includes(b.status));
  const viewing = drivers.find((d) => d.id === viewId);

  const save = async (f) => {
    const res = f.id ? await updateDriver(f.id, f) : await addDriver(f);
    if (!res.ok) return notify(res.error, 'error'); // form stays open so nothing typed is lost
    notify(f.id ? 'Driver updated' : 'Driver added');
    return setEditing(null);
  };

  return (
    <>
      <div className="row-between">
        <p className="muted">{drivers.length} drivers · {drivers.filter((d) => d.available).length} available</p>
        <button className="btn btn-primary" onClick={() => setEditing({ ...BLANK })}><Plus size={16} /> Add Driver</button>
      </div>

      <div className="card">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Driver</th><th>Contact</th><th>Experience</th><th>Languages</th><th>Status</th><th>Available</th><th>Assigned</th><th>Actions</th></tr></thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong><br /><span className="muted">{d.id} · {d.licence}</span></td>
                  <td><a href={`tel:${d.phone}`} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Phone size={13} /> {d.phone}</a></td>
                  <td>{d.experience} yrs</td>
                  <td>{d.languages || '-'}</td>
                  <td><StatusBadge status={open(d.id).length > 0 ? 'On Duty' : d.available ? 'Available' : 'Unavailable'} /></td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={d.available} onChange={async (e) => { const on = e.target.checked; const res = await updateDriver(d.id, { available: on }); notify(res.ok ? (on ? 'Driver marked available' : 'Driver marked unavailable') : res.error, res.ok ? 'success' : 'error'); }} aria-label={`Availability of ${d.name}`} />
                      <i />
                    </label>
                  </td>
                  <td>{open(d.id).length} open / {assigned(d.id).length} total</td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" onClick={() => setViewId(d.id)}><Eye size={13} /> Bookings</button>
                      <button className="mini-btn" onClick={() => setEditing({ ...d })}><Pencil size={13} /> Edit</button>
                      <button className="mini-btn bad" onClick={() => setToDelete(d)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && <tr><td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 32 }}>No drivers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <DriverForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}

      {viewing && (
        <Modal title={`Bookings assigned to ${viewing.name}`} onClose={() => setViewId(null)} footer={<button className="btn btn-dark" onClick={() => setViewId(null)}>Close</button>}>
          {assigned(viewing.id).length === 0 ? <p className="muted">No bookings assigned yet. Assign drivers from Manage Bookings.</p> : (
            <ul className="range-list">
              {assigned(viewing.id).map((b) => {
                const car = getCar(b.carId);
                return (
                  <li key={b.id}>
                    <span><strong>{b.id}</strong> · {car ? `${car.brand} ${car.name}` : 'Removed'}<br /><span className="muted">{formatDate(b.pickupDate)} - {formatDate(b.returnDate)}</span></span>
                    <StatusBadge status={b.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </Modal>
      )}

      {toDelete && (
        <Modal
          title="Delete this driver?"
          onClose={() => setToDelete(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setToDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={async () => { const res = await deleteDriver(toDelete.id); notify(res.ok ? 'Driver deleted' : res.error, res.ok ? 'success' : 'error'); setToDelete(null); }}>Delete driver</button>
          </>}
        >
          <p><strong>{toDelete.name}</strong> will be removed.{open(toDelete.id).length > 0 && ' They still have open bookings, so reassign those first or the server will refuse the delete.'}</p>
        </Modal>
      )}
    </>
  );
}
