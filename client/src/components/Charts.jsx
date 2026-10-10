import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { categoryOf } from '../lib/categories.js';
import { inr, inrShort, monthLabel } from '../lib/format.js';

const IRIS = '#5b5bf0', MINT = '#7fd8b5', MUTED = '#a9a6c9';
const tip = { contentStyle: { borderRadius: 14, border: 'none', boxShadow: '0 8px 30px rgba(60,50,150,.18)', fontFamily: 'inherit' } };

export function CategoryDonut({ data, total }) {
  return (
    <div className="donut">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="category" innerRadius={72} outerRadius={108} paddingAngle={2} stroke="none">
            {data.map((d) => <Cell key={d.category} fill={categoryOf(d.category).color} />)}
          </Pie>
          <Tooltip {...tip} formatter={(v, n) => [inr(v), categoryOf(n).label]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center"><small>Spent</small><strong>{inr(total)}</strong></div>
    </div>
  );
}

export function DailyBars({ daily }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={daily} margin={{ left: -14, right: 4 }}>
        <CartesianGrid vertical={false} stroke="#ecebff" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} interval={2} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={inrShort} />
        <Tooltip {...tip} formatter={(v) => [inr(v), 'Spent']} labelFormatter={(d) => `Day ${d}`} cursor={{ fill: '#f0efff' }} />
        <Bar dataKey="amount" fill={IRIS} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function IncomeExpenseBars({ monthly }) {
  const data = monthly.map((m) => ({ ...m, label: monthLabel(m.month, true) }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -14, right: 4 }}>
        <CartesianGrid vertical={false} stroke="#ecebff" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={inrShort} />
        <Tooltip {...tip} formatter={(v, n) => [inr(v), n]} cursor={{ fill: '#f0efff' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="expenses" name="Expenses" fill={IRIS} radius={[6, 6, 0, 0]} />
        <Bar dataKey="income" name="Income" fill={MINT} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Running total of spending: this month against last month.
export function TrendLine({ daily, previousDaily, uptoDay }) {
  const data = daily.map((d, i) => ({ day: d.day, thisMonth: uptoDay && d.day > uptoDay ? null : d.total, lastMonth: previousDaily[i]?.total ?? null }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ left: -14, right: 8 }}>
        <CartesianGrid vertical={false} stroke="#ecebff" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} interval={2} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={inrShort} />
        <Tooltip {...tip} formatter={(v, n) => [inr(v), n]} labelFormatter={(d) => `Day ${d}`} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="thisMonth" name="This month" stroke={IRIS} strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="lastMonth" name="Last month" stroke={MUTED} strokeWidth={2} strokeDasharray="5 5" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BudgetVsActual({ rows }) {
  const data = rows.map((r) => ({ ...r, label: categoryOf(r.category).label.split(' ')[0] }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -14, right: 4 }}>
        <CartesianGrid vertical={false} stroke="#ecebff" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={inrShort} />
        <Tooltip {...tip} formatter={(v, n) => [inr(v), n]} cursor={{ fill: '#f0efff' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="budget" name="Budget" fill="#d9d8ff" radius={[6, 6, 0, 0]} />
        <Bar dataKey="actual" name="Spent" fill={IRIS} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
