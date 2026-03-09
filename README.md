# E-commerce-Analytic-Platform
# E-commerce-Analytic-Platform

## Deployment Environments

This project supports a clean environment split using dedicated `.env` files and Docker Compose overrides.

### 1) Staging

- Copy `backend/.env.staging.example` to `backend/.env.staging`
- Fill real secrets and staging frontend URL
- Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d --build
```

Backend will be exposed at `http://localhost:4400`.

### 2) Production

- Copy `backend/.env.production.example` to `backend/.env.production`
- Fill real production secrets and production frontend URL
- Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d --build
```

Backend will be exposed at `http://localhost:4000`.
Postgres and Redis are not published to host ports in the production override.

### 3) Health and Readiness

- Liveness: `GET /health`
- Readiness (db + redis): `GET /health/readiness`
