import { query } from '../db.js';
import { SAVINGS_CATEGORY } from '../constants.js';

const EXPENSE = `type = 'expense' AND category <> '${SAVINGS_CATEGORY}'`;

export function monthRange(month) {
  const [y, m] = month.split('-').map(Number);
  const start = `${month}-01`;
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const daysInMonth = new Date(y, m, 0).getDate();
  return { start, next, daysInMonth };
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function monthTotals(userId, month) {
  const { start, next } = monthRange(month);
  const { rows } = await query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE type='income'),0) AS income,
       COALESCE(SUM(amount) FILTER (WHERE ${EXPENSE}),0) AS expenses,
       COALESCE(SUM(amount) FILTER (WHERE type='expense' AND category='${SAVINGS_CATEGORY}'),0) AS to_savings
     FROM transactions WHERE user_id=$1 AND txn_date >= $2 AND txn_date < $3`,
    [userId, start, next]
  );
  return rows[0];
}

async function categoryTotals(userId, month) {
  const { start, next } = monthRange(month);
  const { rows } = await query(
    `SELECT category, SUM(amount) AS amount, COUNT(*) AS count
     FROM transactions WHERE user_id=$1 AND ${EXPENSE} AND txn_date >= $2 AND txn_date < $3
     GROUP BY category ORDER BY amount DESC`,
    [userId, start, next]
  );
  return rows;
}

async function dailyTotals(userId, month) {
  const { start, next } = monthRange(month);
  const { rows } = await query(
    `SELECT to_char(d, 'YYYY-MM-DD') AS date, COALESCE(SUM(t.amount),0) AS amount
     FROM generate_series($2::date, ($3::date - 1), interval '1 day') d
     LEFT JOIN transactions t ON t.txn_date = d::date AND t.user_id=$1 AND t.${EXPENSE.replace(/ AND /g, ' AND t.')}
     GROUP BY d ORDER BY d`,
    [userId, start, next]
  );
  return rows;
}

async function history(userId, month, months = 6) {
  const first = shiftMonth(month, -(months - 1));
  const { next } = monthRange(month);
  const { rows } = await query(
    `SELECT to_char(txn_date, 'YYYY-MM') AS month,
       COALESCE(SUM(amount) FILTER (WHERE type='income'),0) AS income,
       COALESCE(SUM(amount) FILTER (WHERE ${EXPENSE}),0) AS expenses
     FROM transactions WHERE user_id=$1 AND txn_date >= $2 AND txn_date < $3
     GROUP BY 1`,
    [userId, `${first}-01`, next]
  );
  const map = Object.fromEntries(rows.map((r) => [r.month, r]));
  return Array.from({ length: months }, (_, i) => {
    const m = shiftMonth(first, i);
    return { month: m, income: map[m]?.income || 0, expenses: map[m]?.expenses || 0 };
  });
}

export async function getBudgets(userId) {
  const { rows } = await query('SELECT category, amount FROM budgets WHERE user_id=$1', [userId]);
  return Object.fromEntries(rows.map((r) => [r.category, r.amount]));
}

const cumulative = (daily) => {
  let run = 0;
  return daily.map((d) => ({ date: d.date, day: Number(d.date.slice(8)), amount: d.amount, total: (run += d.amount) }));
};

export async function getOverview(userId, month) {
  const prev = shiftMonth(month, -1);
  const [totals, prevTotals, cats, prevCats, daily, prevDaily, hist, budgets, motiveRows, userRow] = await Promise.all([
    monthTotals(userId, month), monthTotals(userId, prev),
    categoryTotals(userId, month), categoryTotals(userId, prev),
    dailyTotals(userId, month), dailyTotals(userId, prev),
    history(userId, month),
    getBudgets(userId),
    query(
      `SELECT motive, SUM(amount) AS amount FROM transactions
       WHERE user_id=$1 AND ${EXPENSE} AND motive IS NOT NULL AND txn_date >= $2 AND txn_date < $3 GROUP BY motive`,
      [userId, monthRange(month).start, monthRange(month).next]
    ),
    query('SELECT monthly_limit, priorities FROM users WHERE id=$1', [userId])
  ]);

  const monthlyLimit = userRow.rows[0]?.monthly_limit || 0;
  const priorities = userRow.rows[0]?.priorities || {};
  const expenses = totals.expenses;
  const budgetTotal = monthlyLimit > 0 ? monthlyLimit : Object.values(budgets).reduce((a, b) => a + b, 0);
  const catMap = Object.fromEntries(cats.map((c) => [c.category, c.amount]));

  const budgetVsActual = Object.entries(budgets).map(([category, budget]) => ({
    category, budget, actual: catMap[category] || 0
  }));

  return {
    month,
    summary: {
      income: totals.income, expenses, saved: totals.income - expenses, toSavings: totals.to_savings,
      budget: budgetTotal, remaining: budgetTotal > 0 ? budgetTotal - expenses : null, monthlyLimit,
      previous: { income: prevTotals.income, expenses: prevTotals.expenses, saved: prevTotals.income - prevTotals.expenses }
    },
    byCategory: cats.map((c) => ({ ...c, percent: expenses > 0 ? Math.round((c.amount / expenses) * 100) : 0 })),
    previousByCategory: prevCats,
    daily: cumulative(daily),
    previousDaily: cumulative(prevDaily),
    monthly: hist,
    budgetVsActual,
    motives: Object.fromEntries(motiveRows.rows.map((r) => [r.motive, r.amount])),
    report: {
      highest: cats.slice(0, 3),
      lowest: [...cats].reverse().slice(0, 3)
    },
    priorities
  };
}
