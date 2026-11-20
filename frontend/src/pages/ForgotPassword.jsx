import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import AuthSide from '../components/AuthSide';
import Field from '../components/Field';
import { isEmail } from '../utils/validators';

// UI only: no email is sent in this frontend-only demo.
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!isEmail(email)) return setError('Enter a valid email address.');
    setError('');
    setSent(true);
  };

  return (
    <div className="auth-page">
      <AuthSide title="Reset your password" text="We will send a reset link to your registered email address." />
      <div className="auth-form-wrap">
        {sent ? (
          <div className="auth-form stack" style={{ textAlign: 'center' }}>
            <div className="confirm-icon" style={{ margin: '0 auto' }}><MailCheck size={28} /></div>
            <h1>Check your email</h1>
            <p className="sub">If an account exists for <strong>{email}</strong>, a password reset link has been sent.</p>
            <p className="muted" style={{ fontSize: '0.85rem' }}>Demo note: this is a frontend-only project, so no email is actually sent.</p>
            <Link to="/login" className="btn btn-dark btn-block">Back to login</Link>
          </div>
        ) : (
          <form className="auth-form stack" onSubmit={submit} noValidate>
            <div>
              <h1>Forgot password?</h1>
              <p className="sub">Enter your email and we will send you a reset link.</p>
            </div>
            <Field label="Email" error={error}>
              <input type="email" value={email} placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <button className="btn btn-primary btn-block btn-lg">Send reset link</button>
            <p className="auth-foot"><Link to="/login">Back to login</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
