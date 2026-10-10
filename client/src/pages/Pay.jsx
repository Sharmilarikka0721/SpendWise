import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import QrScanner from '../components/QrScanner.jsx';
import { CategoryPicker, MotivePicker } from '../components/CategoryPicker.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { inr } from '../lib/format.js';

function buildUpiLink(payee, amount, note) {
  const p = new URLSearchParams({ pa: payee.upiId, pn: payee.payeeName, am: Number(amount).toFixed(2), cu: 'INR' });
  if (note) p.set('tn', note);
  return 'upi://pay?' + p.toString().replace(/\+/g, '%20');
}

export default function Pay() {
  const nav = useNavigate();
  const [tab, setTab] = useState('scan');
  const [payee, setPayee] = useState(null);
  const [f, setF] = useState({ amount: '', category: '', motive: '', note: '' });
  const [step, setStep] = useState('details'); // details -> confirm -> done
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));

  async function handleScan(text) {
    setError('');
    try {
      const { payee: p } = await api.post('/payments/parse', { qr: text });
      setPayee(p);
      setF({ amount: p.amount || '', category: '', motive: '', note: p.note || '' });
      setStep('details');
    } catch (e) { setError(e.message); }
  }

  const ready = Number(f.amount) > 0 && f.category;

  function openUpi() {
    window.location.href = buildUpiLink(payee, f.amount, f.note);
    setStep('confirm');
  }

  async function record() {
    setBusy(true); setError('');
    try {
      await api.post('/transactions', {
        type: 'expense', amount: f.amount, category: f.category, motive: f.motive || null,
        merchant: payee.payeeName, note: f.note, upi_id: payee.upiId, source: 'scan'
      });
      setStep('done');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  const reset = () => { setPayee(null); setStep('details'); setError(''); };

  return (
    <>
      <div className="page-head"><div><h1>Scan &amp; pay</h1><p className="muted">Tell us why you're spending, then pay with your UPI app.</p></div></div>

      <div className="segmented wide" role="tablist">
        <button className={tab === 'scan' ? 'on' : ''} onClick={() => setTab('scan')}>Scan QR</button>
        <button className={tab === 'manual' ? 'on' : ''} onClick={() => setTab('manual')}>Record a purchase</button>
      </div>

      {tab === 'manual' && (
        <div className="card narrow"><TransactionForm onSaved={() => nav('/')} /></div>
      )}

      {tab === 'scan' && !payee && (
        <div className="card narrow">
          <QrScanner onScan={handleScan} />
          {error && <p className="error" role="alert">{error}</p>}
          <p className="muted note">SpendWise doesn't hold your money. You pay in GPay, PhonePe, Paytm or any UPI app, and SpendWise records it so you can understand your spending.</p>
        </div>
      )}

      {tab === 'scan' && payee && step === 'details' && (
        <div className="card narrow">
          <div className="payee"><span className="txn-icon">🏪</span><div><strong>{payee.payeeName}</strong><small>{payee.upiId}</small></div></div>
          <div className="form">
            <label className="field amount-field"><span>Amount</span>
              <div className="amount-input"><b>₹</b>
                <input type="number" inputMode="decimal" min="0" step="0.01" value={f.amount} placeholder="0"
                  onChange={(e) => set('amount')(e.target.value)} readOnly={Boolean(payee.amount)} />
              </div>
            </label>
            <div className="field"><span>What is this for?</span><CategoryPicker value={f.category} onChange={set('category')} /></div>
            <div className="field"><span>Why are you spending it? <em>(optional)</em></span><MotivePicker value={f.motive} onChange={set('motive')} /></div>
            <label className="field"><span>Note</span><input value={f.note} maxLength={80} onChange={(e) => set('note')(e.target.value)} placeholder="Optional" /></label>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={reset}>Scan another</button>
              <button className="btn btn-ghost" disabled={!ready} onClick={() => setStep('confirm')}>I already paid</button>
              <button className="btn btn-primary" disabled={!ready} onClick={openUpi}>Pay {ready ? inr(f.amount) : ''} with UPI app</button>
            </div>
            {!ready && <p className="muted note">Choose a category and amount to continue.</p>}
          </div>
        </div>
      )}

      {tab === 'scan' && payee && step === 'confirm' && (
        <div className="card narrow center">
          <p className="big-emoji">🧾</p>
          <h2>Did the payment of {inr(f.amount)} to {payee.payeeName} go through?</h2>
          <p className="muted">Check your UPI app. We only record payments you confirm.</p>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="form-actions center">
            <button className="btn btn-ghost" onClick={() => setStep('details')}>No, go back</button>
            <button className="btn btn-primary" disabled={busy} onClick={record}>{busy ? 'Saving…' : 'Yes, save it'}</button>
          </div>
        </div>
      )}

      {tab === 'scan' && payee && step === 'done' && (
        <div className="card narrow center">
          <p className="big-emoji">✅</p>
          <h2>Saved</h2>
          <p className="muted">{inr(f.amount)} to {payee.payeeName} is now part of your insights.</p>
          <div className="form-actions center">
            <button className="btn btn-ghost" onClick={() => { reset(); }}>Scan another</button>
            <button className="btn btn-primary" onClick={() => nav('/')}>Back to home</button>
          </div>
        </div>
      )}
    </>
  );
}
