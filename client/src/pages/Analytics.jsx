import { useState } from 'react';
import { api, downloadCsv } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { categoryOf, MOTIVES } from '../lib/categories.js';
import { currentMonth, inr, monthLabel } from '../lib/format.js';
import MonthPicker from '../components/MonthPicker.jsx';
import { BudgetVsActual, CategoryDonut, DailyBars, IncomeExpenseBars, TrendLine } from '../components/Charts.jsx';

function CategoryRank({ title, rows }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {rows.length === 0 ? <p className="muted">Nothing recorded yet.</p> : (
        <ul className="cat-list">
          {rows.map((r) => {
            const c = categoryOf(r.category);
            return <li key={r.category}><span className="dot" style={{ background: c.color }} />{c.emoji} {c.label}<span className="amt">{inr(r.amount)}</span></li>;
          })}
        </ul>
      )}
    </div>
  );
}

export default function Analytics() {
  const [month, setMonth] = useState(currentMonth());
  const { data: o, error } = useFetch(() => api.get(`/analytics/overview?month=${month}`), [month]);
  const isNow = month === currentMonth();
  const motiveTotal = o ? Object.values(o.motives).reduce((a, b) => a + b, 0) : 0;

  return (
    <>
      <div className="page-head">
        <div><h1>Analytics</h1><p className="muted">Calculated from your own transactions.</p></div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>
      {error && <p className="error">{error}</p>}
      {!o && !error && <div className="skeleton tall" />}
      {o && (
        <>
          <section className="grid-2">
            <div className="card">
              <h2>Spending by category</h2>
              {o.byCategory.length ? <CategoryDonut data={o.byCategory} total={o.summary.expenses} /> : <p className="muted">No spending in {monthLabel(month)}.</p>}
            </div>
            <div className="card">
              <h2>Income vs expenses</h2>
              <IncomeExpenseBars monthly={o.monthly} />
            </div>
          </section>

          <section className="grid-2">
            <div className="card">
              <h2>Spending trend</h2>
              <p className="muted small">Running total, compared with last month</p>
              <TrendLine daily={o.daily} previousDaily={o.previousDaily} uptoDay={isNow ? new Date().getDate() : undefined} />
            </div>
            <div className="card">
              <h2>Budget vs actual</h2>
              {o.budgetVsActual.length ? <BudgetVsActual rows={o.budgetVsActual} /> : <p className="muted">Set category budgets in the Budget tab to compare them here.</p>}
            </div>
          </section>

          <section className="grid-2">
            <CategoryRank title="Highest spending" rows={o.report.highest} />
            <CategoryRank title="Lowest spending" rows={o.report.lowest} />
          </section>

          <section className="grid-2">
            <div className="card">
              <h2>Why you spend</h2>
              {motiveTotal === 0 ? <p className="muted">Tag your spending with a reason and the split shows up here.</p> : (
                <ul className="motive-bars">
                  {MOTIVES.filter((m) => o.motives[m.id]).map((m) => (
                    <li key={m.id}>
                      <span>{m.emoji} {m.label}</span>
                      <div className="bar"><span style={{ width: (o.motives[m.id] / motiveTotal) * 100 + '%' }} /></div>
                      <b>{inr(o.motives[m.id])}</b>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card"><h2>Daily spending</h2><DailyBars daily={o.daily} />
              <button className="btn btn-ghost" onClick={() => downloadCsv().catch((e) => alert(e.message))}>Download all data (CSV)</button>
            </div>
          </section>
        </>
      )}
    </>
  );
}
