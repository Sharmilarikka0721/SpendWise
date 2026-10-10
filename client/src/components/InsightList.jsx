const icons = { positive: '🌱', warning: '🔔', improvement: '💡', neutral: '📌' };
const titles = { positive: 'Nice work', warning: 'Heads up', improvement: 'Idea', neutral: 'Good to know' };

export default function InsightList({ insights, limit }) {
  const list = limit ? insights.slice(0, limit) : insights;
  if (!list.length) return <p className="muted">Add a few transactions and your personal insights will appear here.</p>;
  return (
    <ul className="insights">
      {list.map((i, idx) => (
        <li key={idx} className={`insight ${i.type}`}>
          <span className="insight-icon" aria-hidden="true">{icons[i.type]}</span>
          <div><strong>{titles[i.type]}</strong><p>{i.message}</p></div>
        </li>
      ))}
    </ul>
  );
}
