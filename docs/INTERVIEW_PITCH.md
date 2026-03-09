# 2-Minute Interview Pitch

I built a production-grade E-Commerce Analytics platform using a clean backend architecture and a typed frontend dashboard.

On the backend, I used Node.js, Express, TypeScript, Prisma, PostgreSQL, and Redis.  
I enforced a strict Controller -> Service -> Repository layering, so HTTP handling, business logic, and database access are separated.  
Authentication uses short-lived JWT access tokens plus rotating refresh tokens stored in the database, with HTTP-only cookies and password hashing.

For analytics performance, I implemented database-level aggregation endpoints and Redis caching with TTL plus cache invalidation on write events.  
I also added rate limiting on analytics routes and centralized error handling with structured JSON responses.

For production readiness, I containerized services with Docker Compose, added readiness checks for Postgres and Redis, structured JSON logging with request correlation IDs, and created CI gates for backend checks, frontend build, E2E tests, and Docker build validation.

On the frontend, I built a typed analytics dashboard with URL-driven filters, resilient partial-data loading, CSV export, and chart components that consume backend aggregates.

If I had more time, I’d extend this with real cloud deployment automation and additional observability dashboards, but the current system is already deployable and interview-ready.
