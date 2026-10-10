import { CATEGORY_LABELS } from '../constants.js';

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const label = (c) => CATEGORY_LABELS[c] || c;
const lower = (c) => label(c).toLowerCase();
const roundTo50 = (n) => Math.max(50, Math.round(n / 50) * 50);

/**
 * Builds supportive, non-shaming insights from real numbers.
 * input: {
 *   current: {category: amount}, previous: {category: amount},   // expense totals
 *   budgets: {category: amount}, monthlyLimit, spent, income,
 *   motives: {impulse: amount, ...}, goals: [{title,target,saved,status}],
 *   priorities: {category: 'essential'|'flexible'|'treat'},
 *   dayOfMonth, daysInMonth, isCurrentMonth
 * }
 * returns [{type: 'positive'|'warning'|'improvement'|'neutral', category?, message}]
 */
export function generateInsights(input) {
  const {
    current = {}, previous = {}, budgets = {}, monthlyLimit = 0, spent = 0, income = 0,
    motives = {}, goals = [], priorities = {}, dayOfMonth = 1, daysInMonth = 30, isCurrentMonth = true
  } = input;
  const out = [];

  // 1) Budget warnings
  for (const [cat, limit] of Object.entries(budgets)) {
    if (!limit) continue;
    const used = (current[cat] || 0) / limit;
    if (used >= 1) {
      out.push({ type: 'warning', category: cat, message: `You've gone ${inr((current[cat] || 0) - limit)} over your ${lower(cat)} budget. It happens. You could adjust the limit or ease off for the rest of the month.` });
    } else if (used >= 0.9) {
      out.push({ type: 'warning', category: cat, message: `You have used ${Math.round(used * 100)}% of your ${lower(cat)} budget.` });
    } else if (used < 0.8 && current[cat] > 0 && (cat === 'entertainment' || priorities[cat] === 'treat')) {
      out.push({ type: 'positive', category: cat, message: `Your ${lower(cat)} spending is within the budget you set. Enjoying yourself is part of a balanced plan.` });
    }
  }

  // 2) Monthly limit
  if (monthlyLimit > 0) {
    const used = spent / monthlyLimit;
    if (used >= 1) {
      out.push({ type: 'warning', message: `You've passed your monthly limit of ${inr(monthlyLimit)} by ${inr(spent - monthlyLimit)}. A fresh start next month is always possible.` });
    } else if (used >= 0.9) {
      out.push({ type: 'warning', message: `You have used ${Math.round(used * 100)}% of your monthly limit.` });
    } else if (isCurrentMonth && dayOfMonth >= 7) {
      const projected = (spent / dayOfMonth) * daysInMonth;
      if (projected > monthlyLimit * 1.05) {
        out.push({ type: 'warning', message: `At your current pace you may spend about ${inr(projected)} this month, above your ${inr(monthlyLimit)} limit.` });
      }
    }
  }

  // 3) Category changes vs last month
  for (const cat of Object.keys({ ...current, ...previous })) {
    const now = current[cat] || 0, before = previous[cat] || 0;
    if (before < 100 || now === 0 && before === 0) continue;
    const change = (now - before) / before;
    if (change <= -0.1) {
      out.push({ type: 'positive', category: cat, message: `You spent ${Math.round(-change * 100)}% less on ${lower(cat)} than last month.` });
    } else if (change >= 0.15) {
      out.push({ type: 'neutral', category: cat, message: `Your ${lower(cat)} expenses increased ${Math.round(change * 100)}% this month.` });
    }
  }

  // 4) Savings
  if (income > 0) {
    const saved = income - spent;
    if (saved >= income * 0.2) {
      out.push({ type: 'positive', message: `You've kept ${Math.round((saved / income) * 100)}% of your income so far. That's a healthy cushion.` });
    } else if (saved < 0) {
      out.push({ type: 'neutral', message: `Your recorded spending is ${inr(-saved)} above your recorded income this month. Check that all income is added.` });
    }
  }

  // 5) Reasons ("why") awareness
  const motiveTotal = Object.values(motives).reduce((a, b) => a + b, 0);
  if (motiveTotal > 0 && (motives.impulse || 0) / motiveTotal >= 0.25) {
    out.push({ type: 'neutral', message: `About ${Math.round(((motives.impulse || 0) / motiveTotal) * 100)}% of the spending you tagged was impulse. Look through them and notice which ones you're happy about.` });
  }

  // 6) Goal improvement suggestion (never touches essentials)
  const goal = goals.find((g) => g.status === 'active' && g.saved < g.target);
  if (goal) {
    const flex = Object.entries(current)
      .filter(([c, v]) => v >= 400 && priorities[c] !== 'essential' && !['medical', 'savings', 'education'].includes(c) && (priorities[c] === 'flexible' || priorities[c] === 'treat' || ['entertainment', 'shopping', 'snacks'].includes(c)))
      .sort((a, b) => b[1] - a[1])[0];
    if (flex) {
      const cut = Math.min(roundTo50(flex[1] * 0.1), 1000);
      out.push({ type: 'improvement', category: flex[0], message: `Reducing your ${lower(flex[0])} budget by ${inr(cut)} could add ${inr(cut)} a month toward "${goal.title}". Only if it feels right for you.` });
    }
  }

  const order = { warning: 0, improvement: 1, positive: 2, neutral: 3 };
  return out.sort((a, b) => order[a.type] - order[b.type]).slice(0, 8);
}
