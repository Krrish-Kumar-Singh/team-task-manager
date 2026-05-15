# Railway deployment checklist

## Required services

1. **Web service** — this repo
2. **PostgreSQL** — add from Railway dashboard

## Required variables (web service)

| Variable | How to set |
|----------|------------|
| `DATABASE_URL` | Reference from PostgreSQL service → `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | Generate a long random string (32+ chars) |
| `NODE_ENV` | `production` |

Optional: `RAILWAY_PUBLIC_DOMAIN` is set automatically by Railway.

## Link Postgres to the web service

1. Click your **web** service → **Variables**
2. **New Variable** → **Add reference** → select PostgreSQL → `DATABASE_URL`
3. Add `JWT_SECRET` manually
4. Redeploy

## Healthcheck

- Path: `/api/health`
- Must return `200` with `{ "status": "ok" }`

If healthcheck fails, open **Deploy logs** and look for:

- `FATAL: JWT_SECRET` → add `JWT_SECRET`
- `FATAL: DATABASE_URL` → link PostgreSQL
- `P1001` / Can't reach database → Postgres not linked or wrong URL
- `prisma migrate` failed → check pre-deploy logs

## After deploy

Open your Railway public URL — you should see the TaskFlow login page.
