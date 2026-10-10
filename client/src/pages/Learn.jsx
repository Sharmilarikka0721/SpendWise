import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';

function Lesson({ lesson, onBack, onDone }) {
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const complete = answers.filter((a) => a !== undefined).length === lesson.quiz.length;

  async function submit() {
    setErr('');
    try { setResult(await api.post(`/learn/${lesson.id}/quiz`, { answers })); onDone(); }
    catch (e) { setErr(e.message); }
  }

  return (
    <>
      <button className="link back" onClick={onBack}>← All lessons</button>
      <article className="card lesson">
        <p className="big-emoji">{lesson.emoji}</p>
        <h1>{lesson.title}</h1>
        <p className="muted">{lesson.summary}</p>
        {lesson.sections.map((s) => <section key={s.heading}><h3>{s.heading}</h3><p>{s.text}</p></section>)}
        <div className="tips"><h3>Try this</h3><ul>{lesson.tips.map((t) => <li key={t}>{t}</li>)}</ul></div>
        <div className="reflect"><h3>Think about it</h3><p>{lesson.reflect}</p>
          <small className="muted">Your answer is personal. You can set your own priorities in <Link to="/settings" className="link">Settings</Link>.</small></div>
      </article>

      <section className="card quiz">
        <h2>Quick quiz</h2>
        {lesson.quiz.map((q, qi) => (
          <fieldset key={qi} disabled={Boolean(result)}>
            <legend>{qi + 1}. {q.q}</legend>
            {q.options.map((o, oi) => {
              const r = result?.results[qi];
              const cls = r ? (oi === r.answer ? 'right' : answers[qi] === oi ? 'wrong' : '') : answers[qi] === oi ? 'picked' : '';
              return (
                <label key={oi} className={`opt ${cls}`}>
                  <input type="radio" name={`q${qi}`} checked={answers[qi] === oi}
                    onChange={() => setAnswers((a) => { const n = [...a]; n[qi] = oi; return n; })} /> {o}
                </label>
              );
            })}
            {result && <p className="why">{result.results[qi].correct ? '✅ ' : '💡 '}{result.results[qi].why}</p>}
          </fieldset>
        ))}
        {err && <p className="error">{err}</p>}
        {!result ? <button className="btn btn-primary" disabled={!complete} onClick={submit}>Check my answers</button>
          : (
            <div className="score">
              <strong>You got {result.score} of {result.total}</strong>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => { setResult(null); setAnswers([]); }}>Try again</button>
                <button className="btn btn-primary" onClick={onBack}>Back to lessons</button>
              </div>
            </div>
          )}
      </section>
    </>
  );
}

export default function Learn() {
  const { data, error, reload } = useFetch(() => api.get('/learn'), []);
  const [open, setOpen] = useState(null);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <div className="skeleton tall" />;
  const lesson = data.lessons.find((l) => l.id === open);
  if (lesson) return <Lesson lesson={lesson} onBack={() => setOpen(null)} onDone={reload} />;

  const done = Object.keys(data.progress).length;
  return (
    <>
      <div className="page-head"><div><h1>Learn</h1><p className="muted">Short lessons with a quick quiz. {done} of {data.lessons.length} completed.</p></div></div>
      <section className="grid-3">
        {data.lessons.map((l) => {
          const p = data.progress[l.id];
          return (
            <button key={l.id} className="card lesson-card" onClick={() => setOpen(l.id)}>
              <span className="big-emoji">{l.emoji}</span>
              <strong>{l.title}</strong>
              <small className="muted">{l.summary}</small>
              <span className="lesson-meta">{l.minutes} min read{p && <b className="pill achieved">Quiz {p.score}/{p.total}</b>}</span>
            </button>
          );
        })}
      </section>
    </>
  );
}
