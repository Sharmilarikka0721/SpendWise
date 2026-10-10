import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { isMonth, currentMonth, today } from '../validate.js';
import { getOverview, monthRange, getBudgets } from '../services/analytics.js';
import { generateInsights } from '../services/insights.js';

const router = Router();
router.use(requireAuth);

const pick = (req) => (isMonth(req.query.month) ? req.query.month : currentMonth());

// Everything the dashboard and analytics pages need, in one request.
router.get('/overview', async (req, res, next) => {
  try { res.json(await getOverview(req.userId, pick(req))); } catch (e) { next(e); }
});

router.get('/insights', async (req, res, next) => {
  try {
    const month = pick(req);
    const o = await getOverview(req.userId, month);
    const budgets = await getBudgets(req.userId);
    const { rows: goals } = await query('SELECT title,target,saved,status FROM goals WHERE user_id=$1', [req.userId]);
    const { daysInMonth } = monthRange(month);
    const isCurrentMonth = month === currentMonth();
    const insights = generateInsights({
      current: Object.fromEntries(o.byCategory.map((c) => [c.category, c.amount])),
      previous: Object.fromEntries(o.previousByCategory.map((c) => [c.category, c.amount])),
      budgets, monthlyLimit: o.summary.monthlyLimit, spent: o.summary.expenses, income: o.summary.income,
      motives: o.motives, goals, priorities: o.priorities,
      dayOfMonth: isCurrentMonth ? Number(today().slice(8)) : daysInMonth, daysInMonth, isCurrentMonth
    });
    res.json({ month, insights });
  } catch (e) { next(e); }
});

export default router;
