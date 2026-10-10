import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { EXPENSE_CATEGORIES } from '../constants.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT category, amount FROM budgets WHERE user_id=$1 ORDER BY category', [req.userId]);
    res.json({ budgets: rows });
  } catch (e) { next(e); }
});

router.put('/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const amount = Number(req.body.amount);
    if (!EXPENSE_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Unknown category.' });
    if (!Number.isFinite(amount) || amount < 0) return res.status(400).json({ error: 'Enter a budget of 0 or more.' });
    const { rows } = await query(
      `INSERT INTO budgets (user_id, category, amount) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, category) DO UPDATE SET amount = EXCLUDED.amount RETURNING category, amount`,
      [req.userId, category, amount]);
    res.json({ budget: rows[0] });
  } catch (e) { next(e); }
});

router.delete('/:category', async (req, res, next) => {
  try {
    await query('DELETE FROM budgets WHERE user_id=$1 AND category=$2', [req.userId, req.params.category]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
