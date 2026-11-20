import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthSide from '../components/AuthSide';
import Field from '../components/Field';
import PasswordInput from '../components/PasswordInput';
import { useApp } from '../context/AppContext';
import { DEMO_CUSTOMER } from '../data/seed';
import { validateLogin } from '../utils/validators';

export default function Login() {
  const { login, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    setFormError('');
    const res = await login(form.email, form.password);
    setBusy(false);
    if (!res.ok) return setFormError(res.error);
    notify('Welcome back');
    navigate(location.state?.from || '/profile', { replace: true });
  };

  return (
    <div className="auth-page">
      <AuthSide title="Welcome back" text="Log in to manage your bookings, favourites and invoices." />
      <div className="auth-form-wrap">
        <form className="auth-form stack" onSubmit={submit} noValidate>
          <div>
            <h1>Customer Login</h1>
            <p className="sub">Enter your email and password to continue.</p>
          </div>
          {formError && <div className="alert alert-error" role="alert">{formError}</div>}
          <Field label="Email" error={errors.email}>
            <input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Password" error={errors.password}>
            <PasswordInput autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <div className="row-between">
            <span />
            <Link to="/forgot-password" className="link" style={{ fontSize: '0.88rem' }}>Forgot password?</Link>
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? <><span className="spinner spinner-sm" />Signing in...</> : 'Login'}</button>
          <p className="auth-foot">New to DreamsOnWheel? <Link to="/register">Create an account</Link></p>
          <div className="demo-box">
            Demo account:  <strong>{DEMO_CUSTOMER.email}</strong> / <strong>{DEMO_CUSTOMER.password}</strong>{' '}
            <button type="button" onClick={() => setForm({ email: DEMO_CUSTOMER.email, password: DEMO_CUSTOMER.password })}>Fill in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
