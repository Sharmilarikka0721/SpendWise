import { useMemo, useState } from 'react';
import { api, downloadCsv } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { CATEGORIES } from '../lib/categories.js';
import { currentMonth, dayLabel, inr } from '../lib/format.js';
import MonthPicker from '../components/MonthPicker.jsx';
import TransactionRow from '../components/TransactionRow.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import Icon from '../components/Icon.jsx';

export default function Transactions() {
  const [month, setMonth] = useState(currentMonth());
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | transaction
  const { data, error, loading, reload } = useFetch(() => {
    const p = new URLSearchParams({ month, limit: 500 });
    if (q) p.set('q', q);
    if (category) p.set('category', category);
    return api.get('/transactions?' + p);
  }, [month, q, category]);

  const groups = useMemo(() => {
    const g = {};
    (data?.transactions || []).forEach((t) => { (g[t.txn_date] ||= []).push(t); });
    return Object.entries(g);
  }, [data]);

  async function remove(t) {
    if (!window.confirm('Delete this transaction?')) return;
    await api.del(`/transactions/${t.id}`);
    setEditing(null); reload();
  }

  return (
    <>
      <div className="page-head">
        <div><h1>Activity</h1><p className="muted">Everything you've recorded.</p></div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      <div className="toolbar">
        <input className="search" type="search" placeholder="Search by name or note" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={() => downloadCsv().catch((e) => alert(e.message))}>Export CSV</button>
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Icon name="plus" size={18} /> Add</button>
      </div>

      {editing && (
        <div className="modal-back" onClick={() => setEditing(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2>{editing === 'new' ? 'Add a transaction' : 'Edit transaction'}</h2>
            <TransactionForm initial={editing === 'new' ? undefined : { ...editing, amount: String(editing.amount) }}
              onSaved={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />
            {editing !== 'new' && <button className="btn btn-danger btn-block" onClick={() => remove(editing)}><Icon name="trash" size={18} /> Delete</button>}
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {loading && !data && <div className="skeleton tall" />}
      {data && groups.length === 0 && <div className="card center"><p className="big-emoji">🌤️</p><p className="muted">No transactions here yet.</p></div>}
      {groups.map(([date, list]) => (
        <section className="card day" key={date}>
          <div className="card-head"><h3>{dayLabel(date)}</h3>
            <small className="muted">{inr(list.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0))} spent</small></div>
          {list.map((t) => <TransactionRow key={t.id} t={t} onClick={() => setEditing(t)} />)}
        </section>
      ))}
    </>
  );
}
