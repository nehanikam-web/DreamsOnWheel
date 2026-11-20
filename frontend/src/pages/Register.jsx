import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthSide from '../components/AuthSide';
import Field from '../components/Field';
import PasswordInput from '../components/PasswordInput';
import { useApp } from '../context/AppContext';
import { passwordIssues, validateRegister } from '../utils/validators';

export default function Register() {
  const { register, notify } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', agree: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const strength = 4 - passwordIssues(form.password).length;
  const colors = ['#b91c1c', '#b91c1c', '#d97706', '#65a30d', '#15803d'];

  const submit = async (e) => {
    e.preventDefault();
    const v = validateRegister(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    setFormError('');
    const res = await register(form);
    setBusy(false);
    if (!res.ok) return setFormError(res.error);
    notify('Account created. Welcome to DreamsOnWheel');
    navigate('/profile', { replace: true });
  };

  return (
    <div className="auth-page">
      <AuthSide title="Create your account" text="Register once and book any car in a few clicks." />
      <div className="auth-form-wrap">
        <form className="auth-form stack" onSubmit={submit} noValidate>
          <div>
            <h1>Customer Registration</h1>
            <p className="sub">It takes less than a minute.</p>
          </div>
          {formError && <div className="alert alert-error" role="alert">{formError}</div>}
          <Field label="Full name" error={errors.name}><input type="text" autoComplete="name" value={form.name} onChange={set('name')} /></Field>
          <Field label="Email" error={errors.email}><input type="email" autoComplete="email" value={form.email} onChange={set('email')} /></Field>
          <Field label="Mobile number" error={errors.phone}><input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit number" value={form.phone} onChange={set('phone')} /></Field>
          <Field label="Password" error={errors.password}>
            <PasswordInput autoComplete="new-password" value={form.password} onChange={set('password')} />
            {form.password && <div className="strength"><i style={{ width: `${(strength / 4) * 100}%`, background: colors[strength] }} /></div>}
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            <PasswordInput autoComplete="new-password" placeholder="Re-enter password" value={form.confirm} onChange={set('confirm')} />
          </Field>
          <Field error={errors.agree}>
            <span className="check"><input type="checkbox" checked={form.agree} onChange={set('agree')} /> I agree to the rental terms and privacy policy.</span>
          </Field>
          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? <><span className="spinner spinner-sm" />Creating account...</> : 'Create account'}</button>
          <p className="auth-foot">Already registered? <Link to="/login">Login</Link></p>
        </form>
      </div>
    </div>
  );
}
