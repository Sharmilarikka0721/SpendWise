import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, MOTIVES } from './constants.js';

export class ValidationError extends Error {}

export const isMonth = (m) => /^\d{4}-(0[1-9]|1[0-2])$/.test(m || '');
export const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '') && !Number.isNaN(Date.parse(d));

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function cleanAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 100000000) throw new ValidationError('Enter an amount greater than 0.');
  return Math.round(n * 100) / 100;
}

const text = (v, max) => (v == null || v === '' ? null : String(v).trim().slice(0, max));

export function cleanTransaction(body) {
  const type = body.type === 'income' ? 'income' : 'expense';
  const allowed = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!allowed.includes(body.category)) throw new ValidationError('Choose a category.');
  const motive = body.motive || null;
  if (motive && !MOTIVES.includes(motive)) throw new ValidationError('Unknown reason.');
  const date = body.txn_date || today();
  if (!isDate(date)) throw new ValidationError('Enter a valid date.');
  return {
    type, amount: cleanAmount(body.amount), category: body.category,
    motive: type === 'expense' ? motive : null,
    merchant: text(body.merchant, 80), note: text(body.note, 200),
    upi_id: text(body.upi_id, 80), source: body.source === 'scan' ? 'scan' : 'manual', txn_date: date
  };
}
