import { existsSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

if (!existsSync('.env') && existsSync('.env.example')) {
  copyFileSync('.env.example', '.env');
  console.log('Created .env from .env.example');
} else if (existsSync('.env')) {
  console.log('.env already exists; leaving it unchanged.');
} else {
  console.log('No .env.example found; skipping environment file copy.');
}

for (const command of ['prisma:generate', 'db:push', 'db:seed']) {
  const result = spawnSync(npmCommand, ['run', command], { stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
