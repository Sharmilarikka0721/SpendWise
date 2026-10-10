import { describe, it, expect } from 'vitest';
import request from 'supertest';

process.env.JWT_SECRET = 'test-secret';
const { createApp } = await import('../src/app.js');
const app = createApp();

describe('API basics (no database needed)', () => {
  it('health check works', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.ok).toBe(true);
  });
  it('blocks private routes without a token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });
  it('rejects a weak password on register', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'A', email: 'a@b.co', password: '123' });
    expect(res.status).toBe(400);
  });
});
