import { useState } from 'react';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Field from '../components/Field';
import { useApp } from '../context/AppContext';
import { validateContact } from '../utils/validators';
import { sendContactMessage } from '../services/customerService';

const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const { settings, notify, user } = useApp();
  const [form, setForm] = useState({ ...EMPTY, name: user?.name || '', email: user?.email || '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const v = validateContact(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    const res = await sendContactMessage({ name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim() });
    setBusy(false);
    if (!res.ok) return notify(res.error, 'error');
    setSent(true);
    setForm({ ...EMPTY });
    return notify('Message sent. We will reply within one working day.');
  };

  return (
    <>
      <PageHeader title="Contact Us" subtitle="Questions about a booking or a corporate plan? Send us a message." crumbs={[{ label: 'Contact' }]} />
      <div className="container contact-grid">
        <form className="panel stack" onSubmit={submit} noValidate>
          <h3>Send us a message</h3>
          {sent && <div className="alert alert-ok" role="status">Thanks for reaching out. Our team will get back to you within one working day.</div>}
          <div className="form-grid">
            <Field label="Your name" error={errors.name}><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Subject" error={errors.subject} className="full"><input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
            <Field label="Message" error={errors.message} className="full"><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button>
        </form>

        <aside className="panel">
          <h3>Get in touch</h3>
          <div className="info-line"><MapPin size={18} /><div><strong>Office</strong><br /><span className="muted">{settings.address}</span></div></div>
          <div className="info-line"><Phone size={18} /><div><strong>Phone</strong><br /><span className="muted">{settings.phone}</span></div></div>
          <div className="info-line"><Mail size={18} /><div><strong>Email</strong><br /><span className="muted">{settings.email}</span></div></div>
          <div className="info-line"><Clock size={18} /><div><strong>Hours</strong><br /><span className="muted">Office: 9 AM to 8 PM daily<br />Roadside support: 24x7</span></div></div>
        </aside>
      </div>
    </>
  );
}
