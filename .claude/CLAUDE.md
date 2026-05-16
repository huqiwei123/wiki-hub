# Wiki Platform Notes

This project is a Next.js 16 App Router application for a personal wiki/blog with categories, tags, comments, likes, bookmarks, subscriptions, full-text search, and a knowledge graph.

## Current Architecture

- Framework: Next.js 16.2.4 with `src/proxy.ts`
- Database: local PostgreSQL
- Database client: `pg`
- Auth: local email/password auth with database-backed sessions
- Session cookie: HTTP-only opaque token stored as a SHA-256 hash in `sessions`
- Uploads: local filesystem under `public/uploads/post-images`

## Important Files

- `db/migrations/001_local_schema.sql`: local database schema
- `src/lib/db/pool.ts`: PostgreSQL pool
- `src/lib/db/query.ts`: query and transaction helpers
- `src/lib/auth/password.ts`: password hashing and verification
- `src/lib/auth/session.ts`: session creation, lookup, and deletion
- `src/lib/auth/current-user.ts`: `currentUser()`, `requireUser()`, `requireAdmin()`
- `src/queries/*`: SQL read models
- `src/actions/*`: Server Actions with explicit authorization checks
- `src/app/api/upload/route.ts`: admin-only local image upload
- `src/proxy.ts`: lightweight redirect checks for protected routes

## Local Setup

Use `.env.local`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/wiki-platform
SESSION_COOKIE_NAME=wiki_session
SESSION_TTL_DAYS=30
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run:

```bash
npm run db:migrate
npm run admin:create
npm run dev
```

`admin:create` expects `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_USERNAME` in the environment.

## Next.js 16 Notes

This project intentionally uses `src/proxy.ts`. In Next.js 16, Middleware is called Proxy. Keep Proxy lightweight; authorization must still happen in Server Actions, Route Handlers, and the data access layer.
