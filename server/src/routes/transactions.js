import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { cleanTransaction, isMonth } from '../validate.js';
import { monthRange } from '../services/analytics.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const where = ['user_id=$1'];
    const params = [req.userId];
    if (isMonth(req.query.month)) {
      const { start, next: end } = monthRange(req.query.month);
      params.push(start, end);
      where.push(`txn_date >= $${params.length - 1} AND txn_date < $${params.length}`);
    }
    if (req.query.category) { params.push(String(req.query.category)); where.push(`category=$${params.length}`); }
    if (req.query.type === 'income' || req.query.type === 'expense') { params.push(req.query.type); where.push(`type=$${params.length}`); }
    if (req.query.q) { params.push(`%${String(req.query.q).slice(0, 50)}%`); where.push(`(merchant ILIKE $${params.length} OR note ILIKE $${params.length})`); }
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const { rows } = await query(
      `SELECT * FROM transactions WHERE ${where.join(' AND ')} ORDER BY txn_date DESC, id DESC LIMIT ${limit}`, params);
    res.json({ transactions: rows });
  } catch (e) { next(e); }
});

router.get('/export.csv', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM transactions WHERE user_id=$1 ORDER BY txn_date DESC, id DESC', [req.userId]);
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = 'date,type,amount,category,reason,merchant,note';
    const lines = rows.map((r) => [r.txn_date, r.type, r.amount, r.category, r.motive, r.merchant, r.note].map(esc).join(','));
    res.type('text/csv').attachment('spendwise-transactions.csv').send([header, ...lines].join('\n'));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const t = cleanTransaction(req.body);
    const { rows } = await query(
      `INSERT INTO transactions (user_id,type,amount,category,motive,merchant,note,upi_id,source,txn_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.userId, t.type, t.amount, t.category, t.motive, t.merchant, t.note, t.upi_id, t.source, t.txn_date]);
    res.status(201).json({ transaction: rows[0] });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const t = cleanTransaction(req.body);
    const { rows } = await query(
      `UPDATE transactions SET type=$1,amount=$2,category=$3,motive=$4,merchant=$5,note=$6,txn_date=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [t.type, t.amount, t.category, t.motive, t.merchant, t.note, t.txn_date, req.params.id, req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ transaction: rows[0] });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const r = await query('DELETE FROM transactions WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    if (!r.rowCount) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
