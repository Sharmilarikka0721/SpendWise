// Starts the API and the web app together (no extra packages needed).
import { spawn } from 'node:child_process';

const procs = [
  spawn('npm', ['--prefix', 'server', 'run', 'dev'], { stdio: 'inherit', shell: true }),
  spawn('npm', ['--prefix', 'client', 'run', 'dev'], { stdio: 'inherit', shell: true })
];
const stop = () => procs.forEach((p) => p.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
procs.forEach((p) => p.on('exit', stop));
