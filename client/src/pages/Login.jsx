import { useState } from 'react';
import { useAuth } from '../lib/auth.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      if (mode === 'login') await login(f.email, f.password);
      else await register(f.name, f.email, f.password);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="auth">
      <section className="auth-hero">
        <div className="brand"><span className="coin">🪙</span> SpendWise</div>
        <h1>Know why you spend, and spend better.</h1>
        <p>Scan to pay, tell us what it was for, and see your habits take shape. Calm, supportive insights, never guilt.</p>
        <ul className="auth-points">
          <li>Scan UPI QR codes and pay with your own UPI app</li>
          <li>Budgets and savings goals that fit your life</li>
          <li>Short lessons on money, with quizzes</li>
        </ul>
      </section>

      <form className="auth-card" onSubmit={submit}>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        {mode === 'register' && (
          <label className="field"><span>Your name</span><input value={f.name} onChange={set('name')} autoComplete="name" required /></label>
        )}
        <label className="field"><span>Email</span><input type="email" value={f.email} onChange={set('email')} autoComplete="email" required /></label>
        <label className="field"><span>Password</span>
          <input type="password" value={f.password} onChange={set('password')} minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
          {mode === 'register' && <small className="muted">At least 8 characters</small>}
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        {mode === 'login' && (
          <button type="button" className="btn btn-ghost btn-block" onClick={() => setF({ ...f, email: 'demo@spendwise.app', password: 'Demo@1234' })}>
            Fill in the demo account
          </button>
        )}
        <p className="switch">
          {mode === 'login' ? 'New to SpendWise?' : 'Already have an account?'}{' '}
          <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </form>
    </div>
  );
}
