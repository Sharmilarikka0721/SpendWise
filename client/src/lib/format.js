export const inr = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
export const inrShort = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 100000) return '₹' + (v / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
  if (Math.abs(v) >= 1000) return '₹' + (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return '₹' + Math.round(v);
};

const pad = (n) => String(n).padStart(2, '0');
export const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const currentMonth = () => todayISO().slice(0, 7);

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
export function monthLabel(month, short = false) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: short ? 'short' : 'long', year: short ? undefined : 'numeric' });
}
export function dayLabel(iso) {
  const t = todayISO();
  if (iso === t) return 'Today';
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (iso === `${y.getFullYear()}-${pad(y.getMonth() + 1)}-${pad(y.getDate())}`) return 'Yesterday';
  const [yy, mm, dd] = iso.split('-').map(Number);
  return new Date(yy, mm - 1, dd).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
export const percentChange = (now, before) => (before > 0 ? Math.round(((now - before) / before) * 100) : null);
