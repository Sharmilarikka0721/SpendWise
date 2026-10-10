import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { cleanAmount, isDate } from '../validate.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM goals WHERE user_id=$1 ORDER BY status, created_at DESC', [req.userId]);
    res.json({ goals: rows });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim().slice(0, 80);
    if (!title) return res.status(400).json({ error: 'Give your goal a name.' });
    const target = cleanAmount(req.body.target);
    const deadline = req.body.deadline && isDate(req.body.deadline) ? req.body.deadline : null;
    const { rows } = await query(
      'INSERT INTO goals (user_id,title,target,deadline) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.userId, title, target, deadline]);
    res.status(201).json({ goal: rows[0] });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const status = ['active', 'paused', 'achieved'].includes(req.body.status) ? req.body.status : null;
    const title = req.body.title ? String(req.body.title).trim().slice(0, 80) : null;
    const target = req.body.target ? cleanAmount(req.body.target) : null;
    const { rows } = await query(
      `UPDATE goals SET status=COALESCE($1,status), title=COALESCE($2,title), target=COALESCE($3,target)
       WHERE id=$4 AND user_id=$5 RETURNING *`, [status, title, target, req.params.id, req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Goal not found.' });
    res.json({ goal: rows[0] });
  } catch (e) { next(e); }
});

router.post('/:id/funds', async (req, res, next) => {
  try {
    const amount = cleanAmount(req.body.amount);
    const { rows } = await query(
      `UPDATE goals SET saved = saved + $1::numeric,
         status = CASE WHEN saved + $1::numeric >= target THEN 'achieved' ELSE status END
       WHERE id=$2 AND user_id=$3 RETURNING *`, [amount, req.params.id, req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Goal not found.' });
    res.json({ goal: rows[0] });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM goals WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
