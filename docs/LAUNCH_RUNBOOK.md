# Launch Runbook

## 1) Pre-Launch Checklist

- Confirm CI is green on latest commit.
- Confirm backend tests pass: `cd backend && npm test`.
- Confirm frontend build passes: `cd frontend && npm run build`.
- Confirm production env file exists: `backend/.env.production`.
- Confirm production secrets are set and not placeholders:
  - `ACCESS_TOKEN_SECRET`
  - `REFRESH_TOKEN_SECRET`
- Confirm `FRONTEND_URL` is correct for your deployed frontend domain.

## 2) Deploy Backend (Production Profile)

From project root:

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d --build
```

## 3) Validate Runtime Health

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml ps
curl http://localhost:4000/health
curl http://localhost:4000/health/readiness
```

Expected:
- `/health` returns `200`
- `/health/readiness` returns `200` and:
  - `database: "up"`
  - `redis: "up"`

## 4) Smoke Test (Manual)

- Login with seeded or known account.
- Open dashboard.
- Switch revenue windows (`7d`, `30d`, `90d`).
- Check charts update.
- Check CSV export buttons work.
- Check logout works.

## 5) Rollback Procedure

If deployment fails:

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml logs --tail=200 backend
docker compose -f docker-compose.yml -f docker-compose.production.yml down
```

Then redeploy last known good commit.

## 6) Post-Launch Monitoring

- Watch container status:
  - `docker compose ... ps`
- Watch backend logs:
  - `docker compose ... logs -f backend`
- Verify readiness endpoint periodically:
  - `curl http://localhost:4000/health/readiness`
