import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useFetch } from '../lib/useFetch.js';
import { CATEGORIES, categoryOf } from '../lib/categories.js';
import { currentMonth, inr, monthLabel } from '../lib/format.js';

function Ring({ percent }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="ring" role="img" aria-label={`${percent}% saved`}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#ecebff" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="#5b5bf0" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${(Math.min(percent, 100) / 100) * c} ${c}`} transform="rotate(-90 36 36)" />
      <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1f1b3a">{percent}%</text>
    </svg>
  );
}

function GoalCard({ g, onChange }) {
  const [add, setAdd] = useState('');
  const [err, setErr] = useState('');
  const pct = Math.round((g.saved / g.target) * 100);
  const act = async (fn) => { setErr(''); try { await fn(); onChange(); } catch (e) { setErr(e.message); } };
  return (
    <div className={`card goal ${g.status}`}>
      <div className="goal-top">
        <div><h3>{g.title}</h3>
          <small className="muted">{inr(g.saved)} of {inr(g.target)}{g.deadline ? ` · by ${g.deadline}` : ''}</small>
          {g.status !== 'active' && <span className={`pill ${g.status}`}>{g.status === 'achieved' ? 'Achieved 🎉' : 'Paused'}</span>}
        </div>
        <Ring percent={pct} />
      </div>
      {g.status === 'active' && (
        <form className="inline-form" onSubmit={(e) => { e.preventDefault(); act(async () => { await api.post(`/goals/${g.id}/funds`, { amount: add }); setAdd(''); }); }}>
          <input type="number" min="1" inputMode="decimal" placeholder="Add funds (₹)" value={add} onChange={(e) => setAdd(e.target.value)} />
          <button className="btn btn-primary" disabled={!add}>Add</button>
        </form>
      )}
      {err && <p className="error">{err}</p>}
      <div className="goal-actions">
        {g.status !== 'achieved' && <button className="link" onClick={() => act(() => api.put(`/goals/${g.id}`, { status: g.status === 'paused' ? 'active' : 'paused' }))}>{g.status === 'paused' ? 'Resume' : 'Pause'}</button>}
        <button className="link danger" onClick={() => window.confirm('Delete this goal?') && act(() => api.del(`/goals/${g.id}`))}>Delete</button>
      </div>
    </div>
  );
}

export default function Budget() {
  const { user, setUser } = useAuth();
  const month = currentMonth();
  const overview = useFetch(() => api.get(`/analytics/overview?month=${month}`), [month]);
  const goals = useFetch(() => api.get('/goals'), []);
  const [limit, setLimit] = useState(user.monthlyLimit || '');
  const [msg, setMsg] = useState('');
  const [newCat, setNewCat] = useState('');
  const [edits, setEdits] = useState({});
  const [goal, setGoal] = useState({ title: '', target: '', deadline: '' });
  const [goalErr, setGoalErr] = useState('');

  useEffect(() => { setLimit(user.monthlyLimit || ''); }, [user.monthlyLimit]);

  const o = overview.data;
  const spentBy = Object.fromEntries((o?.byCategory || []).map((c) => [c.category, c.amount]));
  const budgetRows = o?.budgetVsActual || [];
  const unbudgeted = CATEGORIES.filter((c) => c.id !== 'savings' && !budgetRows.some((b) => b.category === c.id));

  async function saveLimit(e) {
    e.preventDefault(); setMsg('');
    try {
      const d = await api.put('/auth/settings', { monthlyLimit: Number(limit) || 0 });
      setUser(d.user); overview.reload(); setMsg('Saved');
    } catch (err) { setMsg(err.message); }
  }
  async function saveBudget(category, amount) {
    await api.put(`/budgets/${category}`, { amount: Number(amount) });
    setEdits((s) => { const n = { ...s }; delete n[category]; return n; });
    overview.reload();
  }
  async function addGoal(e) {
    e.preventDefault(); setGoalErr('');
    try {
      await api.post('/goals', { title: goal.title, target: goal.target, deadline: goal.deadline || null });
      setGoal({ title: '', target: '', deadline: '' }); goals.reload();
    } catch (err) { setGoalErr(err.message); }
  }

  return (
    <>
      <div className="page-head"><div><h1>Budget &amp; goals</h1><p className="muted">Plan {monthLabel(month)} your way.</p></div></div>

      <section className="grid-2">
        <form className="card" onSubmit={saveLimit}>
          <h2>Monthly spending limit</h2>
          <p className="muted small">The most you'd like to spend this month. We'll let you know before you reach it.</p>
          <div className="inline-form">
            <div className="amount-input"><b>₹</b><input type="number" min="0" inputMode="decimal" value={limit} placeholder="0" onChange={(e) => setLimit(e.target.value)} /></div>
            <button className="btn btn-primary">Save limit</button>
          </div>
          {msg && <p className={msg === 'Saved' ? 'success' : 'error'}>{msg}</p>}
          {o && o.summary.monthlyLimit > 0 && (
            <>
              <div className={`bar ${o.summary.expenses > o.summary.monthlyLimit ? 'over' : ''}`}>
                <span style={{ width: Math.min(100, (o.summary.expenses / o.summary.monthlyLimit) * 100) + '%' }} /></div>
              <small className="muted">{inr(o.summary.expenses)} spent · {inr(Math.max(0, o.summary.monthlyLimit - o.summary.expenses))} left</small>
            </>
          )}
        </form>

        <div className="card">
          <h2>Category budgets</h2>
          {budgetRows.length === 0 && <p className="muted">No category budgets yet. Add one below.</p>}
          <ul className="budget-list">
            {budgetRows.map((b) => {
              const c = categoryOf(b.category);
              const pct = b.budget > 0 ? Math.round((b.actual / b.budget) * 100) : 0;
              const value = edits[b.category] ?? b.budget;
              return (
                <li key={b.category}>
                  <div className="budget-top"><span>{c.emoji} {c.label}</span><b>{inr(b.actual)} / </b>
                    <input aria-label={`${c.label} budget`} type="number" min="0" value={value}
                      onChange={(e) => setEdits((s) => ({ ...s, [b.category]: e.target.value }))}
                      onBlur={() => edits[b.category] !== undefined && saveBudget(b.category, edits[b.category])} />
                    <button className="link danger" onClick={() => api.del(`/budgets/${b.category}`).then(overview.reload)}>Remove</button>
                  </div>
                  <div className={`bar ${pct >= 100 ? 'over' : pct >= 90 ? 'warn' : ''}`}><span style={{ width: Math.min(100, pct) + '%' }} /></div>
                </li>
              );
            })}
          </ul>
          {unbudgeted.length > 0 && (
            <div className="inline-form">
              <select value={newCat} onChange={(e) => setNewCat(e.target.value)} aria-label="Category to budget">
                <option value="">Choose a category</option>
                {unbudgeted.map((c) => <option key={c.id} value={c.id}>{c.label}{spentBy[c.id] ? ` (spent ${inr(spentBy[c.id])})` : ''}</option>)}
              </select>
              <button className="btn btn-primary" disabled={!newCat}
                onClick={() => saveBudget(newCat, Math.max(500, Math.ceil((spentBy[newCat] || 500) / 100) * 100)).then(() => setNewCat(''))}>Add budget</button>
            </div>
          )}
        </div>
      </section>

      <div className="card-head spaced"><h2>Savings goals</h2></div>
      <section className="grid-3">
        {goals.data?.goals.map((g) => <GoalCard key={g.id} g={g} onChange={goals.reload} />)}
        <form className="card goal-new" onSubmit={addGoal}>
          <h3>New goal</h3>
          <label className="field"><span>What are you saving for?</span><input value={goal.title} maxLength={80} placeholder="Books, laptop, trip…" onChange={(e) => setGoal({ ...goal, title: e.target.value })} /></label>
          <label className="field"><span>Target amount (₹)</span><input type="number" min="1" value={goal.target} placeholder="5000" onChange={(e) => setGoal({ ...goal, target: e.target.value })} /></label>
          <label className="field"><span>Target date <em>(optional)</em></span><input type="date" value={goal.deadline} onChange={(e) => setGoal({ ...goal, deadline: e.target.value })} /></label>
          {goalErr && <p className="error">{goalErr}</p>}
          <button className="btn btn-primary btn-block">Create goal</button>
        </form>
      </section>
    </>
  );
}
