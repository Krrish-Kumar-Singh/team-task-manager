# Railway setup (TaskFlow)

## Your config is mostly correct

These settings are fine:

- `builder = NIXPACKS`
- `startCommand = npm start`
- `healthcheckPath = /api/health`

## Required variables (web service `team-task-manager`)

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | **Variable reference** → Postgres → `DATABASE_URL` |
| `JWT_SECRET` | Long secret string |
| `NODE_ENV` | `production` |

## Do NOT set

| Variable | Why |
|----------|-----|
| `PORT` | Railway sets this automatically — `PORT=3001` breaks healthcheck |
| `CLIENT_ORIGIN=http://localhost:5173` | Wrong for production |

## Optional

`CLIENT_ORIGIN` = your public Railway URL, e.g. `https://xxx.up.railway.app`

## Dashboard vs repo

Railway reads `railway.json` / `railway.toml` from GitHub. After push, redeploy.

In the dashboard you can set **healthcheckTimeout** to **300** (seconds).

## Test after deploy

```
https://YOUR-APP.up.railway.app/api/health
```

Expect: `"status": "ok"`, `"hasDatabase": true`, `"hasJwt": true`

## Project layout (one project)

```
Postgres          → Online
team-task-manager → Online (after variables + deploy)
```
