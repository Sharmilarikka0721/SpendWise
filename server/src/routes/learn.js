import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const lessons = JSON.parse(fs.readFileSync(path.join(dir, '../../data/lessons.json'), 'utf8'));
const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT lesson_id, score, total FROM lesson_progress WHERE user_id=$1', [req.userId]);
    const progress = Object.fromEntries(rows.map((r) => [r.lesson_id, { score: r.score, total: r.total }]));
    // Answers are checked on the server, so they are not sent to the browser.
    const safe = lessons.map((l) => ({ ...l, quiz: l.quiz.map(({ q, options }) => ({ q, options })) }));
    res.json({ lessons: safe, progress });
  } catch (e) { next(e); }
});

router.post('/:id/quiz', async (req, res, next) => {
  try {
    const lesson = lessons.find((l) => l.id === req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const results = lesson.quiz.map((q, i) => ({ correct: answers[i] === q.answer, answer: q.answer, why: q.why }));
    const score = results.filter((r) => r.correct).length;
    await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, score, total) VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET score = GREATEST(lesson_progress.score, EXCLUDED.score), total = EXCLUDED.total, completed_at = now()`,
      [req.userId, lesson.id, score, lesson.quiz.length]);
    res.json({ score, total: lesson.quiz.length, results });
  } catch (e) { next(e); }
});

export default router;
