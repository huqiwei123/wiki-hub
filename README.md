# Wiki Platform

Next.js 16 knowledge-base and blog platform backed by a local PostgreSQL database.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL via `pg`
- Database-backed HTTP-only sessions
- Local image uploads under `public/uploads/post-images`

## Environment

Create `.env.local`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/wiki-platform
SESSION_COOKIE_NAME=wiki_session
SESSION_TTL_DAYS=30
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Database

Apply the local schema:

```bash
npm run db:migrate
```

Create or reset a local admin:

```bash
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="change-me-now"
$env:ADMIN_USERNAME="admin"
npm run admin:create
```

## Development

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

If an old `.next` cache is locked on Windows, stop the running Next/Node process or clear `.next` before building.
