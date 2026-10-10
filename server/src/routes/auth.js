import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { PRIORITY_LEVELS, EXPENSE_CATEGORIES } from '../constants.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' } });

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, monthlyLimit: u.monthly_limit, priorities: u.priorities });

router.post('/register', limiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, 60);
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name) return res.status(400).json({ error: 'Enter your name.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Use a password with at least 8 characters.' });
    const exists = await query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (exists.rowCount) return res.status(409).json({ error: 'An account with this email already exists. Try signing in.' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      'INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING *', [name, email, hash]);
    res.status(201).json({ token: signToken(rows[0]), user: publicUser(rows[0]) });
  } catch (e) { next(e); }
});

router.post('/login', limiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
    const ok = rows[0] && (await bcrypt.compare(String(req.body.password || ''), rows[0].password_hash));
    if (!ok) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.json({ token: signToken(rows[0]), user: publicUser(rows[0]) });
  } catch (e) { next(e); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id=$1', [req.userId]);
    if (!rows[0]) return res.status(401).json({ error: 'Account not found.' });
    res.json({ user: publicUser(rows[0]) });
  } catch (e) { next(e); }
});

// Update name, monthly limit and the user's own spending priorities.
router.put('/settings', requireAuth, async (req, res, next) => {
  try {
    const { rows: cur } = await query('SELECT * FROM users WHERE id=$1', [req.userId]);
    const name = req.body.name != null ? String(req.body.name).trim().slice(0, 60) || cur[0].name : cur[0].name;
    let limit = cur[0].monthly_limit;
    if (req.body.monthlyLimit != null) {
      limit = Number(req.body.monthlyLimit);
      if (!Number.isFinite(limit) || limit < 0) return res.status(400).json({ error: 'Monthly limit must be 0 or more.' });
    }
    let priorities = cur[0].priorities;
    if (req.body.priorities && typeof req.body.priorities === 'object') {
      priorities = {};
      for (const [cat, level] of Object.entries(req.body.priorities)) {
        if (EXPENSE_CATEGORIES.includes(cat) && PRIORITY_LEVELS.includes(level)) priorities[cat] = level;
      }
    }
    const { rows } = await query(
      'UPDATE users SET name=$1, monthly_limit=$2, priorities=$3 WHERE id=$4 RETURNING *',
      [name, limit, JSON.stringify(priorities), req.userId]);
    res.json({ user: publicUser(rows[0]) });
  } catch (e) { next(e); }
});

export default router;
