import { describe, it, expect } from 'vitest';
import { generateInsights } from '../src/services/insights.js';

const base = { dayOfMonth: 20, daysInMonth: 30, isCurrentMonth: true };

describe('generateInsights', () => {
  it('celebrates spending less than last month', () => {
    const r = generateInsights({ ...base, current: { snacks: 850 }, previous: { snacks: 1000 } });
    expect(r.find((i) => i.type === 'positive').message).toContain('15% less on snacks');
  });
  it('warns at 90% of a category budget', () => {
    const r = generateInsights({ ...base, current: { travel: 900 }, budgets: { travel: 1000 } });
    expect(r[0]).toMatchObject({ type: 'warning' });
    expect(r[0].message).toContain('90%');
  });
  it('uses neutral wording for increases', () => {
    const r = generateInsights({ ...base, current: { education: 1500 }, previous: { education: 1000 } });
    expect(r.find((i) => i.category === 'education').type).toBe('neutral');
  });
  it('suggests trimming a flexible category for a goal, never an essential one', () => {
    const r = generateInsights({
      ...base, current: { entertainment: 2000, groceries: 5000 }, previous: {},
      priorities: { groceries: 'essential', entertainment: 'treat' },
      goals: [{ title: 'Laptop', target: 40000, saved: 1000, status: 'active' }]
    });
    const tip = r.find((i) => i.type === 'improvement');
    expect(tip.category).toBe('entertainment');
    expect(tip.message).toContain('₹200');
  });
  it('never uses shaming words', () => {
    const r = generateInsights({ ...base, current: { entertainment: 3000, shopping: 3000 }, previous: { entertainment: 1000 }, budgets: { entertainment: 1000 }, spent: 6000, monthlyLimit: 5000, income: 5000 });
    for (const i of r) expect(i.message).not.toMatch(/waste|stupid|bad|irresponsible|reckless/i);
  });
});
