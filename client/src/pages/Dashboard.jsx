import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useFetch } from '../lib/useFetch.js';
import { currentMonth, inr, monthLabel, percentChange } from '../lib/format.js';
import { categoryOf } from '../lib/categories.js';
import MonthPicker from '../components/MonthPicker.jsx';
import InsightList from '../components/InsightList.jsx';
import TransactionRow from '../components/TransactionRow.jsx';
import { CategoryDonut, DailyBars, IncomeExpenseBars } from '../components/Charts.jsx';

function Delta({ now, before, goodWhenUp }) {
  const p = percentChange(now, before);
  if (p === null) return <small className="delta flat">no data for last month</small>;
  if (p === 0) return <small className="delta flat">same as last month</small>;
  const good = goodWhenUp ? p > 0 : p < 0;
  return <small className={`delta ${good ? 'good' : 'soft'}`}>{p > 0 ? '▲' : '▼'} {Math.abs(p)}% vs last month</small>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const overview = useFetch(() => api.get(`/analytics/overview?month=${month}`), [month]);
  const insights = useFetch(() => api.get(`/analytics/insights?month=${month}`), [month]);
  const recent = useFetch(() => api.get(`/transactions?month=${month}&limit=5`), [month]);
  const o = overview.data;

  return (
    <>
      <div className="page-head">
        <div><h1>Hi {user.name.split(' ')[0]} 👋</h1><p className="muted">Here is how your money is doing.</p></div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {overview.error && <p className="error">{overview.error}</p>}
      {!o && !overview.error && <div className="skeleton tall" />}

      {o && (
        <>
          <section className="hero card">
            <div>
              <p className="muted">{o.summary.remaining === null ? 'Money spent this month' : o.summary.remaining >= 0 ? 'Remaining budget' : 'Over budget by'}</p>
              <p className="hero-number">{inr(o.summary.remaining === null ? o.summary.expenses : Math.abs(o.summary.remaining))}</p>
              {o.summary.budget > 0 ? (
                <>
                  <div className={`bar ${o.summary.expenses > o.summary.budget ? 'over' : ''}`}>
                    <span style={{ width: Math.min(100, (o.summary.expenses / o.summary.budget) * 100) + '%' }} />
                  </div>
                  <small className="muted">{inr(o.summary.expenses)} of {inr(o.summary.budget)} used</small>
                </>
              ) : (
                <small className="muted">Set a monthly limit in <Link to="/budget" className="link">Budget</Link> to track what's left.</small>
              )}
            </div>
            <Link to="/pay" className="btn btn-primary hero-cta">Scan &amp; pay</Link>
          </section>

          <section className="stats">
            <div className="card stat"><small>Income</small><strong>{inr(o.summary.income)}</strong><Delta now={o.summary.income} before={o.summary.previous.income} goodWhenUp /></div>
            <div className="card stat"><small>Expenses</small><strong>{inr(o.summary.expenses)}</strong><Delta now={o.summary.expenses} before={o.summary.previous.expenses} /></div>
            <div className="card stat"><small>Money saved</small><strong className={o.summary.saved < 0 ? 'neg' : ''}>{inr(o.summary.saved)}</strong><small className="muted">income minus expenses</small></div>
            <div className="card stat"><small>Put into savings</small><strong>{inr(o.summary.toSavings)}</strong><small className="muted">tracked, not counted as spending</small></div>
          </section>

          <section className="grid-2">
            <div className="card">
              <h2>Your insights</h2>
              <InsightList insights={insights.data?.insights || []} limit={4} />
            </div>
            <div className="card">
              <h2>Where it went</h2>
              {o.byCategory.length === 0 ? <p className="muted">No spending recorded for {monthLabel(month)} yet.</p> : (
                <>
                  <CategoryDonut data={o.byCategory} total={o.summary.expenses} />
                  <ul className="cat-list">
                    {o.byCategory.slice(0, 4).map((c) => {
                      const cat = categoryOf(c.category);
                      return (
                        <li key={c.category}><span className="dot" style={{ background: cat.color }} />{cat.emoji} {cat.label}
                          <b>{c.percent}%</b><span className="amt">{inr(c.amount)}</span></li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </section>

          <section className="grid-2">
            <div className="card"><h2>Daily spending</h2><DailyBars daily={o.daily} /></div>
            <div className="card"><h2>Income vs expenses</h2><IncomeExpenseBars monthly={o.monthly} /></div>
          </section>

          <section className="card">
            <div className="card-head"><h2>Recent activity</h2><Link to="/transactions" className="link">See all</Link></div>
            {recent.data?.transactions.length ? recent.data.transactions.map((t) => <TransactionRow key={t.id} t={t} />)
              : <p className="muted">Nothing yet. Tap the scan button to record your first payment.</p>}
          </section>
        </>
      )}
    </>
  );
}
