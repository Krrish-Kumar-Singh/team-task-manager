import 'dotenv/config';
import { execSync } from 'node:child_process';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, '..');
const app = express();

// Railway injects PORT — never hardcode PORT=3001 in Railway variables
const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0';

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

function healthPayload() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasDatabase: Boolean(process.env.DATABASE_URL),
      hasJwt: Boolean(process.env.JWT_SECRET),
      port: PORT,
    },
  };
}

// Health routes — always 200 so Railway healthcheck passes once Node is up
app.get('/health', (_req, res) => res.status(200).json(healthPayload()));
app.get('/api/health', (_req, res) => res.status(200).json(healthPayload()));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.warn('client/dist not found — run npm run build');
}

app.use(errorHandler);

// Start server immediately (required for Railway healthcheck)
app.listen(PORT, HOST, () => {
  console.log(`Listening on http://${HOST}:${PORT}`);

  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set — auth will not work');
  }
  if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL is not set — database will not work');
    return;
  }

  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', {
      cwd: serverRoot,
      stdio: 'inherit',
      env: process.env,
    });
    console.log('Migrations complete');
  } catch (err) {
    console.error('Migration failed (app still running):', err.message);
  }
});
