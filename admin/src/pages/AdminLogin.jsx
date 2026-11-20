import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Field from '../components/Field';
import PasswordInput from '../components/PasswordInput';
import { useApp } from '../context/AppContext';
import { ADMIN_ACCOUNT } from '../data/seed';
import { validateLogin } from '../utils/validators';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

export default function AdminLogin() {
  const { adminLogin, isAdmin } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAdmin) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    setFormError('');
    const res = await adminLogin(form.email, form.password);
    setBusy(false);
    if (!res.ok) return setFormError(res.error);
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card stack" onSubmit={submit} noValidate>
        <div>
          <Logo to="/login" />
          <h1>Admin Sign In</h1>
          <p className="muted">Restricted area. Staff only.</p>
        </div>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <Field label="Admin email" error={errors.email}>
          <input type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? <><span className="spinner spinner-sm" />Signing in...</> : 'Sign in'}</button>
        <div className="demo-box" style={{ marginTop: 0 }}>
          Demo admin: <strong>{ADMIN_ACCOUNT.email}</strong> / <strong>{ADMIN_ACCOUNT.password}</strong>{' '}
          <button type="button" onClick={() => setForm({ email: ADMIN_ACCOUNT.email, password: ADMIN_ACCOUNT.password })}>Fill in</button>
        </div>
        <p className="auth-foot" style={{ marginTop: 0 }}><a href={SITE_URL}>Back to website</a></p>
      </form>
    </div>
  );
}
