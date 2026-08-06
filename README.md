# Boilerplate

Starting point for new projects: a NestJS API with JWT authentication
(httpOnly cookies + refresh token), permission-based authorization (RBAC),
Postgres via TypeORM, Redis, i18n, and an audit trail already in place.

## How to run

1. Copy `.env.example` to `.env` at the project root.
2. Bring up the containers:

   ```sh
   docker compose up
   ```

This builds the images, runs the migrations and seeds, and leaves the API
running at `http://localhost:3000` (Swagger docs at `/api/docs`) and the web
frontend at `http://localhost:5173`.

An admin user is already created by the seed, with credentials defined by
`ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`.

In development (`docker-compose.override.yml`, applied automatically), the
code runs with hot-reload and [MailHog](http://localhost:8025) captures any
e-mail sent by the API instead of actually delivering it.

Files uploaded through the API (e.g. a user's avatar) go to a local
[MinIO](http://localhost:9001) instance, S3-compatible.
