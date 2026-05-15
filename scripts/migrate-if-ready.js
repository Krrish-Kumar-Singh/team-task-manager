/**
 * Safe migrate for Railway pre-deploy. Never fails the deploy (always exit 0).
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, '..', 'server');

try {
  if (!process.env.DATABASE_URL) {
    console.log('[migrate] DATABASE_URL not set — skip (migrations run at app start)');
    process.exit(0);
  }

  console.log('[migrate] Running prisma migrate deploy...');
  execSync('npx prisma migrate deploy', {
    cwd: serverRoot,
    stdio: 'inherit',
    env: process.env,
  });
  console.log('[migrate] Done');
  process.exit(0);
} catch (err) {
  console.warn('[migrate] Non-fatal error (deploy continues):', err?.message ?? err);
  process.exit(0);
}
