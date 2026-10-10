// One-command setup: installs dependencies and creates server/.env with a random JWT secret.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

console.log('\n[1/3] Installing server packages…');
run('npm --prefix server install');
console.log('\n[2/3] Installing client packages…');
run('npm --prefix client install');

console.log('\n[3/3] Creating configuration…');
if (!existsSync('server/.env')) {
  const env = readFileSync('server/.env.example', 'utf8').replace('JWT_SECRET=change-me', `JWT_SECRET=${randomBytes(32).toString('hex')}`);
  writeFileSync('server/.env', env);
  console.log('Created server/.env');
} else console.log('server/.env already exists, leaving it as is.');

console.log(`
All set! Next:
  1) npm run db       (starts PostgreSQL in Docker, or edit DATABASE_URL in server/.env to use your own)
  2) npm run seed     (optional: loads demo data, login demo@spendwise.app / Demo@1234)
  3) npm run dev      (opens the app at http://localhost:5173)
`);
