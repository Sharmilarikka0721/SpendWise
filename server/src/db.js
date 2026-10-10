import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Return DATE as 'YYYY-MM-DD' text, NUMERIC as numbers, COUNT as numbers.
pg.types.setTypeParser(1082, (v) => v);
pg.types.setTypeParser(1700, (v) => parseFloat(v));
pg.types.setTypeParser(20, (v) => parseInt(v, 10));

const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false;
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl });

export const query = (text, params) => pool.query(text, params);

export async function initDb() {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const sql = fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8');
  await pool.query(sql);
}
