import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RotateCcw } from 'lucide-react';
import Field from '../components/Field';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';
import { isEmail, isPhone } from '../utils/validators';

export default function AdminSettings() {
  const { adminProfile, setAdminProfile, settings, setSettings, logout, notify, resetDemoData } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(adminProfile);
  const [site, setSite] = useState({ ...settings, gstRate: String(settings.gstRate) });
  const [pErr, setPErr] = useState({});
  const [sErr, setSErr] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    const v = {};
    if (profile.name.trim().length < 3) v.name = 'Enter your name.';
    if (!isEmail(profile.email)) v.email = 'Enter a valid email.';
    setPErr(v);
    if (Object.keys(v).length) return;
    const res = await setAdminProfile({ name: profile.name.trim(), email: profile.email.trim() });
    notify(res.ok ? 'Admin profile saved' : res.error, res.ok ? 'success' : 'error');
  };

  const saveSite = async (e) => {
    e.preventDefault();
    const v = {};
    if (!site.siteName.trim()) v.siteName = 'Website name is required.';
    if (!isEmail(site.email)) v.email = 'Enter a valid email.';
    if (!isPhone(site.phone.replace(/\D/g, '').slice(-10))) v.phone = 'Enter a valid phone number.';
    const gst = Number(site.gstRate);
    if (!(gst >= 0 && gst <= 28)) v.gstRate = 'GST must be between 0 and 28.';
    setSErr(v);
    if (Object.keys(v).length) return;
    const res = await setSettings({ ...site, gstRate: gst });
    notify(res.ok ? 'Website information saved' : res.error, res.ok ? 'success' : 'error');
  };

  return (
    <>
      <div className="equal-col">
        <form className="card" onSubmit={saveProfile} noValidate>
          <div className="card-head"><h3>Admin profile</h3></div>
          <div className="card-body stack">
            <Field label="Name" error={pErr.name}><input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
            <Field label="Email" error={pErr.email}><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Field>
            <p className="muted" style={{ fontSize: '0.82rem' }}>Demo note: changing the email here does not change the admin login credentials.</p>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save profile</button>
          </div>
        </form>

        <form className="card" onSubmit={saveSite} noValidate>
          <div className="card-head"><h3>Website information</h3></div>
          <div className="card-body stack">
            <Field label="Website name" error={sErr.siteName}><input type="text" value={site.siteName} onChange={(e) => setSite({ ...site, siteName: e.target.value })} /></Field>
            <Field label="Tagline"><input type="text" value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} /></Field>
            <Field label="Support email" error={sErr.email}><input type="email" value={site.email} onChange={(e) => setSite({ ...site, email: e.target.value })} /></Field>
            <Field label="Phone" error={sErr.phone}><input type="text" value={site.phone} onChange={(e) => setSite({ ...site, phone: e.target.value })} /></Field>
            <Field label="Address"><textarea style={{ minHeight: 70 }} value={site.address} onChange={(e) => setSite({ ...site, address: e.target.value })} /></Field>
            <Field label="GST rate (%)" error={sErr.gstRate} hint="Applied to new bookings."><input type="number" min="0" max="28" value={site.gstRate} onChange={(e) => setSite({ ...site, gstRate: e.target.value })} /></Field>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save website info</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-head"><h3>Session and demo data</h3></div>
        <div className="card-body row-between">
          <p className="muted">Reset restores the original cars, bookings, drivers and accounts in this browser.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => setConfirmReset(true)}><RotateCcw size={16} /> Reset demo data</button>
            <button className="btn btn-dark" onClick={() => { logout(); navigate('/login'); }}><LogOut size={16} /> Logout</button>
          </div>
        </div>
      </div>

      {confirmReset && (
        <Modal
          title="Reset all demo data?"
          onClose={() => setConfirmReset(false)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setConfirmReset(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={resetDemoData}>Reset everything</button>
          </>}
        >
          <p>This clears everything stored in this browser, including registered customers, new bookings, edited cars and favourites, and logs you out.</p>
        </Modal>
      )}
    </>
  );
}
