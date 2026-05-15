# Railway deploy fix guide

## Error: `Environment variable not found: DATABASE_URL`

This happens when **migrations run before** `DATABASE_URL` exists on the web service.

### Fix 1 — Pre-deploy command (can't delete in UI?)

The repo now **overrides** the dashboard via `railway.toml` / `railway.json`:

- Pre-deploy is a harmless `echo` (no Prisma)
- Migrations run when the app starts

**Redeploy from GitHub** after pulling latest `main`.

If the UI still shows an old command, ignore it — repo config wins on deploy.

Optional: **team-task-manager** → **Settings** → enable **Config-as-code** / use repo `railway.toml`.

---

### Fix 2 — Link Postgres to the web service

`DATABASE_URL` must be on **team-task-manager**, not only on Postgres.

1. Click **team-task-manager** → **Variables**
2. **+ New Variable** → **Add variable reference**
3. Service: **Postgres**
4. Variable: **`DATABASE_URL`**
5. Save

Also add manually:

| Name | Value |
|------|--------|
| `JWT_SECRET` | any long secret |
| `NODE_ENV` | `production` |

**Delete:** `PORT`, `CLIENT_ORIGIN=localhost`

---

### Fix 3 — Do not use root `db:migrate` on Railway

Never set these on Railway:

- Pre-deploy: `npm run db:migrate`
- Start: `npm run db:migrate && npm start`

Use only:

```
npm start
```

---

## Correct deploy flow

```
Build  → npm install + npm run build
Start  → npm start → node server (migrations run inside app)
Health → GET /api/health → 200 OK
```

---

## Test

`https://YOUR-APP.up.railway.app/api/health`

```json
{ "status": "ok", "env": { "hasDatabase": true, "hasJwt": true } }
```
