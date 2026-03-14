# E-Commerce Analytics Platform

Production-style full-stack analytics platform for e-commerce reporting, built with a clean backend architecture and a typed frontend dashboard.

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- Redis (cache)
- JWT auth (access + refresh token rotation)
- Zod validation
- Docker / Docker Compose

### Frontend
- React + TypeScript + Vite
- Tailwind CSS
- Recharts
- Axios
- Playwright E2E

## Architecture

Backend follows strict separation:

`Controller -> Service -> Repository -> Prisma`

- **Controllers**: HTTP request/response only
- **Services**: business logic
- **Repositories**: data access only
- **Prisma**: used only in repositories

## Project Structure

```text
backend/
  src/
    controllers/
    services/
    repositories/
    routes/
    middleware/
    utils/
    config/
    prisma/
    types/
    app.ts
    server.ts
frontend/
  src/
    app/
    pages/
    features/
    routes/
    services/
    config/
```

## Core Features

- Role-based auth (`ADMIN`, `MANAGER`, `ANALYST`)
- Access + refresh token flow with rotation
- Analytics endpoints with aggregation/grouping
- Redis caching with TTL + invalidation
- Rate limiting on analytics routes
- Centralized error handling
- Structured JSON logs + request correlation IDs (`x-request-id`)
- Health and readiness checks:
  - `/health`
  - `/health/readiness`
- Dashboard filters with URL state
- CSV export from dashboard panels

## Local Setup (Without Docker)

### 1) Install dependencies

```bash
cd backend && npm ci
cd ../frontend && npm ci
```

### 2) Configure env files

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

### 3) Prepare database schema

```bash
cd backend
npx prisma db push --schema src/prisma/schema.prisma
```

### 4) Seed demo data

```bash
npm run prisma:seed
```

### 5) Run apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Docker Setup

Base stack:

```bash
docker compose up -d --build
```

Staging profile:

```bash
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d --build
```

Production profile:

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d --build
```

## Environment Files

Backend templates:

- `backend/.env.example` (local)
- `backend/.env.docker.example` (docker local/prod-like)
- `backend/.env.staging.example`
- `backend/.env.production.example`

Important variables:

- `APP_ENV` (`local|staging|production`)
- `NODE_ENV`
- `FRONTEND_URL`
- `DATABASE_URL`
- `REDIS_URL`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- token expiry settings

## API Docs

When backend is running:

- OpenAPI JSON: `http://localhost:4000/openapi.json`
- Swagger UI: `http://localhost:4000/docs`

## Testing

Backend unit/integration-style tests:

```bash
cd backend
npm test
```

Frontend build check:

```bash
cd frontend
npm run build
```

Frontend E2E:

```bash
cd frontend
npm run test:e2e:install
npm run test:e2e
```

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

Pipeline includes:
- Backend checks (install, prisma generate, test, build)
- Frontend checks (install, build)
- Frontend E2E
- Docker build check

## Deployment (Free-Tier Friendly)

Recommended recruiter-demo setup:

- Backend: Render Web Service
- Frontend: Vercel or Render Static Site
- Postgres: Neon
- Redis: Upstash

Set backend `DATABASE_URL` to Neon URL and `REDIS_URL` to Upstash Redis URL.

## Troubleshooting

### Dashboard shows API mismatch warning
- Backend and frontend versions are out of sync.
- Redeploy backend and verify routes in `/openapi.json`.

### Vercel refresh gives 404
- Ensure `frontend/vercel.json` rewrite is present and redeploy frontend.

### Seed fails with table not found
- Run schema sync first:
  - `npx prisma db push --schema src/prisma/schema.prisma`
- Then seed.

### Health checks
- Liveness: `/health`
- Readiness: `/health/readiness`

## Extra Docs

- Launch runbook: `docs/LAUNCH_RUNBOOK.md`
- Branch protection guide: `docs/BRANCH_PROTECTION.md`
- Interview pitch: `docs/INTERVIEW_PITCH.md`
