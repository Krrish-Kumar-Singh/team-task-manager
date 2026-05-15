# Railway reset guide (port / deploy issues)

## 1. Variables on **team-task-manager** only

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Reference → Postgres → `DATABASE_URL` |
| `JWT_SECRET` | any long secret |
| `NODE_ENV` | `production` |

**DELETE these if they exist:**

- `PORT` (Railway sets this automatically)
- `CLIENT_ORIGIN=http://localhost:5173`

## 2. Networking port

After a successful deploy, open **Deploy logs** and find:

```
[startup] Railway PORT=8080 listening on ...
[startup] Set public networking target port to 8080
```

Use **that number** as the public domain target port (usually **8080**).

**Settings → Networking → Public → Generate Domain → Target port: 8080**

If logs show a different port, use that port instead.

## 3. Redeploy

- **Deployments** → **Redeploy** on latest commit
- Wait for **Build** then **Deploy** to finish
- Commit should include `Dockerfile` (Docker build, not only Nixpacks)

## 4. Pre-deploy

Repo sets `preDeployCommand = "true"` (always succeeds).

## 5. Test

- `https://team-task-manager-production-e493.up.railway.app/api/health`
- `https://team-task-manager-production-e493.up.railway.app`
