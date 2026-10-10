import { useState } from 'react';
import { CategoryPicker, MotivePicker } from './CategoryPicker.jsx';
import { api } from '../lib/api.js';
import { todayISO } from '../lib/format.js';

export default function TransactionForm({ initial, onSaved, onCancel, source = 'manual' }) {
  const [f, setF] = useState({
    type: 'expense', amount: '', category: '', motive: '', merchant: '', note: '', txn_date: todayISO(), ...initial
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const isIncome = f.type === 'income';

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!(Number(f.amount) > 0)) return setError('Enter an amount greater than 0.');
    if (!f.category) return setError(isIncome ? 'Choose where the money came from.' : 'Choose a category so we know what it was for.');
    setBusy(true);
    try {
      const body = { ...f, source };
      const data = f.id ? await api.put(`/transactions/${f.id}`, body) : await api.post('/transactions', body);
      onSaved?.(data.transaction);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="segmented" role="tablist">
        {['expense', 'income'].map((t) => (
          <button type="button" key={t} className={f.type === t ? 'on' : ''}
            onClick={() => setF((s) => ({ ...s, type: t, category: '', motive: '' }))}>
            {t === 'expense' ? 'Spent' : 'Received'}
          </button>
        ))}
      </div>

      <label className="field amount-field">
        <span>Amount</span>
        <div className="amount-input"><b>₹</b>
          <input inputMode="decimal" type="number" min="0" step="0.01" placeholder="0" value={f.amount}
            onChange={(e) => set('amount')(e.target.value)} autoFocus />
        </div>
      </label>

      <div className="field"><span>{isIncome ? 'Where did it come from?' : 'What was it for?'}</span>
        <CategoryPicker value={f.category} onChange={set('category')} income={isIncome} />
      </div>

      {!isIncome && (
        <div className="field"><span>Why did you spend it? <em>(optional)</em></span>
          <MotivePicker value={f.motive} onChange={set('motive')} />
        </div>
      )}

      <div className="row-2">
        <label className="field"><span>{isIncome ? 'From' : 'Paid to'}</span>
          <input value={f.merchant || ''} onChange={(e) => set('merchant')(e.target.value)} placeholder="Optional" maxLength={80} /></label>
        <label className="field"><span>Date</span>
          <input type="date" value={f.txn_date} max={todayISO()} onChange={(e) => set('txn_date')(e.target.value)} /></label>
      </div>
      <label className="field"><span>Note</span>
        <input value={f.note || ''} onChange={(e) => set('note')(e.target.value)} placeholder="Optional" maxLength={200} /></label>

      {error && <p className="error" role="alert">{error}</p>}
      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : f.id ? 'Save changes' : 'Save'}</button>
      </div>
    </form>
  );
}
