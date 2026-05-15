# TaskFlow — Team Task Manager

Full-stack web app for project management, task assignment, and progress tracking with **Admin / Member** role-based access.

## Live demo

> Deploy to Railway and add your live URL here after deployment.

## Features

- **Authentication** — Sign up and sign in with JWT
- **Projects & teams** — Create projects, invite members by email, manage roles
- **Tasks** — Create, assign, update status, due dates, filters (including overdue)
- **Dashboard** — Stats, your tasks, overdue list, recent projects
- **RBAC** — Project-level Admin vs Member permissions

## Tech stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 19, Vite 6, Tailwind CSS 4  |
| Backend  | Node.js 22, Express 5, Prisma 6     |
| Database | PostgreSQL                          |
| Deploy   | Railway (Nixpacks, Node 22 pinned)  |

## Railway deployment

Railway is configured for **Node 22 LTS** (see `.nvmrc`, `nixpacks.toml`, `engines` in `package.json`) to avoid common Nixpacks issues with Node 23 (EOL) and Python version mismatches.

### Steps

1. Push this repo to GitHub.
2. In [Railway](https://railway.com), create a **New Project** → **Deploy from GitHub repo**.
3. Add a **PostgreSQL** plugin to the project.
4. On the **web service**, set variables:
   - `DATABASE_URL` — reference from Postgres service (Railway auto-links)
   - `JWT_SECRET` — long random string (e.g. `openssl rand -hex 32`)
   - `NODE_ENV` — `production`
5. Deploy. Migrations run automatically via `npm start` → `prisma migrate deploy`.
6. Open the generated public URL — the API and UI are served from one service.

### Health check

`GET /api/health` — used by `railway.toml` for deploy healthchecks.

## Local development

### Prerequisites

- Node.js **22.x**
- PostgreSQL

### Setup

```bash
# Clone and install
git clone <your-repo-url>
cd team-task-manager
npm install

# Server env
cp server/.env.example server/.env
# Edit DATABASE_URL and JWT_SECRET in server/.env

# Run migrations
npm run db:migrate --prefix server

# Start API + UI
npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api` to the server)
- API: http://localhost:3001

### Production build locally

```bash
npm run build
cd server && node src/index.js
```

## API overview

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/projects` | List / create projects |
| GET/PATCH/DELETE | `/api/projects/:id` | Project CRUD |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| GET | `/api/tasks/project/:projectId` | List tasks |
| POST | `/api/tasks/project/:projectId` | Create task |
| PATCH/DELETE | `/api/tasks/:id` | Update / delete task |
| GET | `/api/dashboard` | Dashboard stats |

All protected routes require `Authorization: Bearer <token>`.

## Role permissions

| Action | Admin | Member |
| ------ | ----- | ------ |
| Edit project / add members | Yes | No |
| Create tasks | Yes | Yes |
| Edit own / assigned tasks | Yes | Yes |
| Delete tasks | Yes | Creator only |
| Change member roles | Yes | No |

## License

MIT
