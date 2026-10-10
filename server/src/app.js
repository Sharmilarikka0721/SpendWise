import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import txnRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import analyticsRoutes from './routes/analytics.js';
import learnRoutes from './routes/learn.js';
import paymentRoutes from './routes/payments.js';
import { ValidationError } from './validate.js';

export function createApp() {
  const app = express();
  const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());
  app.use(helmet());
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', txnRoutes);
  app.use('/api/budgets', budgetRoutes);
  app.use('/api/goals', goalRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/learn', learnRoutes);
  app.use('/api/payments', paymentRoutes);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
  });
  return app;
}
