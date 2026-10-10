import { CATEGORIES, INCOME_CATEGORIES, MOTIVES } from '../lib/categories.js';

export function CategoryPicker({ value, onChange, income = false }) {
  const list = income ? INCOME_CATEGORIES : CATEGORIES;
  return (
    <div className="chip-grid" role="radiogroup" aria-label="Category">
      {list.map((c) => (
        <button type="button" key={c.id} role="radio" aria-checked={value === c.id}
          className={`chip ${value === c.id ? 'on' : ''}`} onClick={() => onChange(c.id)}>
          <span className="chip-emoji">{c.emoji}</span> {c.label}
        </button>
      ))}
    </div>
  );
}

export function MotivePicker({ value, onChange }) {
  return (
    <div className="chip-grid motives" role="radiogroup" aria-label="Why are you spending this?">
      {MOTIVES.map((m) => (
        <button type="button" key={m.id} role="radio" aria-checked={value === m.id}
          className={`chip ${value === m.id ? 'on' : ''}`} onClick={() => onChange(value === m.id ? '' : m.id)}>
          <span className="chip-emoji">{m.emoji}</span>
          <span>{m.label}<small>{m.hint}</small></span>
        </button>
      ))}
    </div>
  );
}
