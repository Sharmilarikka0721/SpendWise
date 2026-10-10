import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { pool, query, initDb } from './db.js';

// Loads datasets/sample_transactions.csv into a demo account so every chart has data to show.
// Dates are shifted so the data always ends today. Real users start with an empty account.
const dir = path.dirname(fileURLToPath(import.meta.url));
const csv = fs.readFileSync(path.join(dir, '../../datasets/sample_transactions.csv'), 'utf8').trim().split('\n').slice(1);
const DEMO = { name: 'Demo Student', email: 'demo@spendwise.app', password: 'Demo@1234' };

const iso = (daysAgo) => {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

await initDb();
await query('DELETE FROM users WHERE email=$1', [DEMO.email]);
const hash = await bcrypt.hash(DEMO.password, 10);
const priorities = { groceries: 'essential', education: 'essential', travel: 'essential', medical: 'essential', bills: 'flexible', snacks: 'flexible', shopping: 'treat', entertainment: 'treat' };
const { rows } = await query(
  'INSERT INTO users (name,email,password_hash,monthly_limit,priorities) VALUES ($1,$2,$3,$4,$5) RETURNING id',
  [DEMO.name, DEMO.email, hash, 9000, JSON.stringify(priorities)]);
const userId = rows[0].id;

for (const line of csv) {
  const [daysAgo, type, amount, category, motive, merchant, note] = line.split(',');
  if (Number(daysAgo) < 0) continue;
  await query(
    `INSERT INTO transactions (user_id,type,amount,category,motive,merchant,note,txn_date,source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'manual')`,
    [userId, type, Number(amount), category, motive || null, merchant || null, note || null, iso(Number(daysAgo))]);
}
for (const [cat, amt] of Object.entries({ snacks: 1500, travel: 1800, entertainment: 1200, shopping: 1500, groceries: 1200, education: 1500 })) {
  await query('INSERT INTO budgets (user_id,category,amount) VALUES ($1,$2,$3)', [userId, cat, amt]);
}
await query(`INSERT INTO goals (user_id,title,target,saved,deadline) VALUES
  ($1,'Laptop',40000,12000,$2), ($1,'Books for next semester',5000,3500,NULL), ($1,'Emergency fund',10000,2000,NULL)`,
  [userId, iso(-200)]);

console.log(`Seeded ${csv.length} transactions.\nDemo login -> ${DEMO.email} / ${DEMO.password}`);
await pool.end();
