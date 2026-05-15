# Railway deploy fix guide

## Error: `Environment variable not found: DATABASE_URL`

This happens when **migrations run before** `DATABASE_URL` exists on the web service.

### Fix 1 — Remove pre-deploy migrate (IMPORTANT)

1. Open **team-task-manager** (web service, not Postgres)
2. **Settings** → **Deploy**
3. Find **Pre-deploy command** / **Pre-deploy**
4. **Clear it** (must be empty — delete `npm run db:migrate` if present)
5. **Start command** should be only: `npm start`
6. Save and **Redeploy**

Migrations run automatically when the app starts (after `DATABASE_URL` is loaded).

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
