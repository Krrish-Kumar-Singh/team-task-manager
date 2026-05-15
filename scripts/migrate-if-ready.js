/**
 * Safe migrate for Railway pre-deploy (may run before env vars are injected).
 * Exits 0 if DATABASE_URL is missing so deploy is not blocked.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, '..', 'server');

if (!process.env.DATABASE_URL) {
  console.log('[migrate] DATABASE_URL not set — skipping (migrations run when app starts)');
  process.exit(0);
}

console.log('[migrate] Running prisma migrate deploy...');
execSync('npx prisma migrate deploy', {
  cwd: serverRoot,
  stdio: 'inherit',
  env: process.env,
});
console.log('[migrate] Done');
