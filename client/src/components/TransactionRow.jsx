import { categoryOf, motiveOf } from '../lib/categories.js';
import { inr } from '../lib/format.js';

export default function TransactionRow({ t, onClick }) {
  const c = categoryOf(t.category);
  const m = motiveOf(t.motive);
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className="txn" onClick={onClick}>
      <span className="txn-icon" style={{ background: c.color + '33' }}>{c.emoji}</span>
      <span className="txn-main">
        <strong>{t.merchant || c.label}</strong>
        <small>{c.label}{m ? ` · ${m.label.toLowerCase()}` : ''}{t.note ? ` · ${t.note}` : ''}</small>
      </span>
      <span className={`txn-amt ${t.type}`}>{t.type === 'income' ? '+' : '-'}{inr(t.amount)}</span>
    </Tag>
  );
}
