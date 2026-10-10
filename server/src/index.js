import 'dotenv/config';
import { createApp } from './app.js';
import { initDb, pool } from './db.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me') {
  console.error('JWT_SECRET is not set. Run "npm run setup" from the project folder, or set it in server/.env');
  process.exit(1);
}

try {
  await initDb();
} catch (e) {
  console.error('\nCould not connect to PostgreSQL:', e.message);
  console.error('Start the database with "docker compose up -d" (see README) or fix DATABASE_URL in server/.env\n');
  await pool.end().catch(() => {});
  process.exit(1);
}

const port = process.env.PORT || 4000;
createApp().listen(port, () => console.log(`SpendWise API running on http://localhost:${port}`));
