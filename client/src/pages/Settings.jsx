import { useState } from 'react';
import { api, downloadCsv } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { CATEGORIES, PRIORITIES } from '../lib/categories.js';

export default function Settings() {
  const { user, setUser, signOut } = useAuth();
  const [name, setName] = useState(user.name);
  const [priorities, setPriorities] = useState(user.priorities || {});
  const [msg, setMsg] = useState('');

  async function save() {
    setMsg('');
    try {
      const d = await api.put('/auth/settings', { name, priorities });
      setUser(d.user); setMsg('Saved');
    } catch (e) { setMsg(e.message); }
  }

  return (
    <>
      <div className="page-head"><div><h1>Settings</h1><p className="muted">{user.email}</p></div></div>

      <section className="card">
        <h2>Your name</h2>
        <label className="field"><span className="sr">Name</span><input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></label>
      </section>

      <section className="card">
        <h2>Your spending priorities</h2>
        <p className="muted small">You decide what's essential for you. SpendWise only suggests trimming categories you mark as flexible or treat, and never essentials.</p>
        <ul className="priority-list">
          {CATEGORIES.filter((c) => c.id !== 'savings').map((c) => (
            <li key={c.id}>
              <span>{c.emoji} {c.label}</span>
              <div className="segmented small">
                {PRIORITIES.map((p) => (
                  <button key={p.id} type="button" className={priorities[c.id] === p.id ? 'on' : ''}
                    onClick={() => setPriorities((s) => ({ ...s, [c.id]: p.id }))}>{p.label}</button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="form-actions">
          {msg && <span className={msg === 'Saved' ? 'success' : 'error'}>{msg}</span>}
          <button className="btn btn-primary" onClick={save}>Save settings</button>
        </div>
      </section>

      <section className="card">
        <h2>Your data</h2>
        <div className="form-actions left">
          <button className="btn btn-ghost" onClick={() => downloadCsv().catch((e) => setMsg(e.message))}>Export transactions (CSV)</button>
          <button className="btn btn-danger" onClick={signOut}>Sign out</button>
        </div>
      </section>
    </>
  );
}
