import Icon from './Icon.jsx';
import { currentMonth, monthLabel, shiftMonth } from '../lib/format.js';

export default function MonthPicker({ month, onChange }) {
  const atNow = month >= currentMonth();
  return (
    <div className="month-picker">
      <button className="icon-btn" onClick={() => onChange(shiftMonth(month, -1))} aria-label="Previous month"><Icon name="left" size={18} /></button>
      <strong>{monthLabel(month)}</strong>
      <button className="icon-btn" onClick={() => onChange(shiftMonth(month, 1))} disabled={atNow} aria-label="Next month"><Icon name="right" size={18} /></button>
    </div>
  );
}
