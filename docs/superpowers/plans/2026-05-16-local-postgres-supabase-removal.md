# Local Postgres Supabase Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every Supabase dependency from the wiki platform and replace it with a local Next.js backend backed by PostgreSQL and local file storage.

**Architecture:** Keep the existing App Router UI, Server Actions, query modules, and route handlers, but replace Supabase clients with a server-only data access layer built on `pg`. Authentication moves from Supabase Auth to database-backed sessions stored in an HTTP-only cookie; authorization moves from Supabase RLS policies into explicit DAL checks and Server Action guards. Storage moves from Supabase Storage to `public/uploads/post-images` with the upload route enforcing admin authorization.

**Tech Stack:** Next.js 16.2.4 App Router and `src/proxy.ts`, React 19, TypeScript, PostgreSQL, `pg`, Node `crypto`, Server Actions, Route Handlers, local filesystem uploads.

---

## Current Supabase Surface

Supabase is currently used in:

- SDK modules: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/public.ts`, `src/lib/supabase/admin.ts`
- Auth/session/proxy: `src/actions/auth.ts`, `src/proxy.ts`, `src/app/admin/layout.tsx`, `src/app/(main)/blog/[slug]/page.tsx`
- Server Actions: `src/actions/admin.ts`, `src/actions/bookmarks.ts`, `src/actions/comments.ts`, `src/actions/likes.ts`, `src/actions/posts.ts`, `src/actions/subscriptions.ts`
- Query modules: `src/queries/bookmarks.ts`, `src/queries/categories.ts`, `src/queries/comments.ts`, `src/queries/graph.ts`, `src/queries/likes.ts`, `src/queries/posts.ts`, `src/queries/search.ts`, `src/queries/subscribers.ts`, `src/queries/tags.ts`
- Route handlers: `src/app/api/subscribe/route.ts`, `src/app/api/upload/route.ts`
- Metadata route: `src/app/sitemap.ts`
- Seed scripts: `src/lib/seed.ts`, `src/lib/seed-articles.ts`
- SQL migrations: `supabase/migrations/*.sql`
- Dependencies/env/docs: `package.json`, `package-lock.json`, `.env.example`, `README.md`, `CLAUDE.md`

Next.js 16 local docs checked:

- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`: Middleware is now Proxy; Proxy should stay lightweight and not be the only authorization boundary.
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md`: recommended pattern is DAL-centered session verification; Server Actions and Route Handlers must authorize internally.
- `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`: Server Functions are directly reachable via POST, so every mutation must verify auth/role.
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`: App Router Route Handlers live under `app/**/route.ts`, support standard HTTP methods, and are not cached by default.

## Target File Structure

Create:

- `db/migrations/001_local_schema.sql`: local PostgreSQL schema replacing Supabase Auth/RLS/storage assumptions.
- `src/lib/db/pool.ts`: server-only `pg` connection pool.
- `src/lib/db/query.ts`: typed query helper and transaction helper.
- `src/lib/db/migrate.ts`: migration runner for local schema.
- `src/lib/auth/password.ts`: password hashing and verification using Node `crypto.scrypt`.
- `src/lib/auth/session.ts`: opaque session token creation, lookup, renewal, and deletion.
- `src/lib/auth/current-user.ts`: React-cached session/user lookup plus `requireUser()` and `requireAdmin()`.
- `src/lib/storage/local-images.ts`: image validation, safe filename generation, write helper, and public URL helper.
- `src/queries/post-shape.ts`: shared row-to-`Post` mapping helpers for joined SQL rows.
- `scripts/migrate.ts`: executable migration entry.
- `scripts/create-admin.ts`: local admin bootstrap script.
- `public/uploads/post-images/.gitkeep`: keep upload directory present.

Modify:

- `package.json`: remove Supabase packages; add scripts for migration/admin bootstrap.
- `package-lock.json`: regenerate after dependency removal.
- `.env.example`: replace Supabase env vars with `DATABASE_URL`, `SESSION_COOKIE_NAME`, `SESSION_TTL_DAYS`.
- `src/proxy.ts`: replace Supabase session refresh with lightweight local session cookie lookup.
- `src/actions/auth.ts`: replace Supabase sign-in/sign-up/sign-out with local DB auth.
- `src/actions/*.ts`: replace Supabase mutations with SQL and explicit auth guards.
- `src/queries/*.ts`: replace Supabase reads/RPC calls with SQL queries.
- `src/app/api/upload/route.ts`: replace Supabase Storage with local file storage.
- `src/app/api/subscribe/route.ts`: replace Supabase insert/upsert with SQL.
- `src/app/admin/layout.tsx`, `src/app/admin/posts/[id]/edit/page.tsx`, `src/app/(main)/blog/[slug]/page.tsx`, `src/app/sitemap.ts`: use DAL/query helpers instead of Supabase clients.
- `src/types/index.ts`: add `email` to `Profile` if the UI/admin code needs it; keep existing public fields stable.
- `src/lib/seed.ts`: replace with local SQL seed or remove in favor of `scripts/create-admin.ts`.

Delete after replacement is verified:

- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/public.ts`
- `src/lib/supabase/admin.ts`
- `supabase/`

## Security Decisions

- Use database-backed sessions, not JWT. Browser receives only an opaque random token in an HTTP-only cookie.
- Store only `sha256(sessionToken)` in `sessions.token_hash`.
- Store password hashes as `scrypt:N:r:p:salt:hash`.
- Keep `src/proxy.ts` for user experience redirects only. Enforce real security in `requireUser()`, `requireAdmin()`, Server Actions, Route Handlers, and SQL `WHERE` clauses.
- Replace Supabase RLS with application-level authorization:
  - Public can read published posts, categories, tags, approved comments, like counts, graph data, RSS, sitemap.
  - Admin can manage posts, categories, tags, subscriptions, uploads.
  - Authenticated users can manage their own bookmarks, likes, comments.
  - Guest comments are allowed only when `guest_name` is present and `author_id` is null.

## Database Schema

Use `db/migrations/001_local_schema.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  role text NOT NULL DEFAULT 'reader' CHECK (role IN ('admin', 'reader')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_image text,
  reading_time int NOT NULL DEFAULT 0,
  view_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(content, '')), 'C')
  ) STORED
);

CREATE INDEX idx_posts_fts ON posts USING gin (fts);
CREATE INDEX idx_posts_slug ON posts (slug);
CREATE INDEX idx_posts_published ON posts (published, published_at DESC);
CREATE INDEX idx_posts_author ON posts (author_id);
CREATE INDEX idx_posts_category ON posts (category_id);

CREATE TABLE post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE post_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  target_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  target_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_links_source ON post_links (source_post_id);
CREATE INDEX idx_post_links_target ON post_links (target_post_id);

CREATE TABLE bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks (user_id);
CREATE INDEX idx_bookmarks_post ON bookmarks (post_id);

CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name text,
  guest_email text,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (author_id IS NOT NULL AND guest_name IS NULL)
    OR
    (author_id IS NULL AND guest_name IS NOT NULL)
  )
);

CREATE INDEX idx_comments_post_id ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

CREATE TABLE likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_likes_target ON likes(target_type, target_id);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Task 1: Establish Local Database Foundation

**Files:**

- Create: `db/migrations/001_local_schema.sql`
- Create: `src/lib/db/pool.ts`
- Create: `src/lib/db/query.ts`
- Create: `src/lib/db/migrate.ts`
- Create: `scripts/migrate.ts`
- Modify: `package.json`
- Modify: `.env.example`

- [ ] **Step 1: Add the local schema**

Create `db/migrations/001_local_schema.sql` with the schema in the "Database Schema" section.

- [ ] **Step 2: Add server-only pool**

Create `src/lib/db/pool.ts`:

```ts
import "server-only";
import pg from "pg";

const { Pool } = pg;

declare global {
  var __wikiPgPool: pg.Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export const pool =
  globalThis.__wikiPgPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__wikiPgPool = pool;
}
```

- [ ] **Step 3: Add query helpers**

Create `src/lib/db/query.ts`:

```ts
import "server-only";
import type pg from "pg";
import { pool } from "./pool";

export async function query<T>(text: string, values: unknown[] = []) {
  const result = await pool.query<T>(text, values);
  return result.rows;
}

export async function queryOne<T>(text: string, values: unknown[] = []) {
  const rows = await query<T>(text, values);
  return rows[0] ?? null;
}

export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

- [ ] **Step 4: Add a migration runner**

Create `src/lib/db/migrate.ts`:

```ts
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "./pool";

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const migrationsDir = path.join(process.cwd(), "db", "migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const existing = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE filename = $1",
      [file],
    );
    if (existing.rowCount) continue;

    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [
        file,
      ]);
      await pool.query("COMMIT");
      console.log(`Applied ${file}`);
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }
}
```

Create `scripts/migrate.ts`:

```ts
import { migrate } from "../src/lib/db/migrate";
import { pool } from "../src/lib/db/pool";

await migrate();
await pool.end();
```

- [ ] **Step 5: Update scripts and env**

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "db:migrate": "tsx --env-file=.env.local scripts/migrate.ts",
    "admin:create": "tsx --env-file=.env.local scripts/create-admin.ts"
  }
}
```

Update `.env.example`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/wiki_platform
SESSION_COOKIE_NAME=wiki_session
SESSION_TTL_DAYS=30
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 6: Verify migration**

Run:

```bash
npm run db:migrate
```

Expected: `Applied 001_local_schema.sql`.

- [ ] **Step 7: Commit**

```bash
git add db/migrations src/lib/db scripts/migrate.ts package.json .env.example
git commit -m "feat: add local postgres foundation"
```

## Task 2: Replace Supabase Auth with Local Sessions

**Files:**

- Create: `src/lib/auth/password.ts`
- Create: `src/lib/auth/session.ts`
- Create: `src/lib/auth/current-user.ts`
- Create: `scripts/create-admin.ts`
- Modify: `src/actions/auth.ts`
- Modify: `src/proxy.ts`

- [ ] **Step 1: Add password hashing**

Create `src/lib/auth/password.ts`:

```ts
import "server-only";
import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);
const keyLength = 64;
const params = { N: 16384, r: 8, p: 1 };

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = (await scrypt(password, salt, keyLength, params)) as Buffer;
  return `scrypt:${params.N}:${params.r}:${params.p}:${salt}:${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, n, r, p, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !n || !r || !p || !salt || !hash) return false;

  const derived = (await scrypt(password, salt, keyLength, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  })) as Buffer;

  const expected = Buffer.from(hash, "base64url");
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}
```

- [ ] **Step 2: Add session management**

Create `src/lib/auth/session.ts`:

```ts
import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { queryOne } from "@/lib/db/query";

export type SessionUser = {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: "admin" | "reader";
};

const cookieName = process.env.SESSION_COOKIE_NAME ?? "wiki_session";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function sessionTtlMs() {
  const days = Number(process.env.SESSION_TTL_DAYS ?? "30");
  return days * 24 * 60 * 60 * 1000;
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + sessionTtlMs());

  await queryOne(
    "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, tokenHash, expiresAt],
  );

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (token) {
    await queryOne("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  }
  cookieStore.delete(cookieName);
}

export async function getSessionUserFromToken(token: string | undefined) {
  if (!token) return null;

  return queryOne<SessionUser>(
    `
    SELECT p.id, p.email, p.username, p.display_name, p.avatar_url, p.bio, p.role
    FROM sessions s
    JOIN profiles p ON p.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > now()
    `,
    [hashToken(token)],
  );
}

export async function getCurrentSessionUser() {
  const cookieStore = await cookies();
  return getSessionUserFromToken(cookieStore.get(cookieName)?.value);
}
```

- [ ] **Step 3: Add current-user guards**

Create `src/lib/auth/current-user.ts`:

```ts
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "./session";

export const currentUser = cache(async () => getCurrentSessionUser());

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
```

- [ ] **Step 4: Rewrite auth actions**

Replace `src/actions/auth.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { queryOne } from "@/lib/db/query";
import { createSession, deleteCurrentSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

type AuthUserRow = {
  id: string;
  email: string;
  password_hash: string;
};

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await queryOne<AuthUserRow>(
    "SELECT id, email, password_hash FROM profiles WHERE email = $1",
    [email],
  );

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    redirect("/login?error=Invalid%20email%20or%20password");
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect("/admin/dashboard");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password || !username) {
    redirect("/signup?error=Email%2C%20username%2C%20and%20password%20are%20required");
  }

  const passwordHash = await hashPassword(password);

  try {
    await queryOne(
      `
      INSERT INTO profiles (email, password_hash, username, display_name, role)
      VALUES ($1, $2, $3, $3, 'admin')
      `,
      [email, passwordHash, username],
    );
  } catch {
    redirect("/signup?error=Account%20already%20exists");
  }

  revalidatePath("/", "layout");
  redirect("/login?registered=1");
}

export async function logout() {
  await deleteCurrentSession();
  revalidatePath("/", "layout");
  redirect("/");
}
```

- [ ] **Step 5: Rewrite proxy**

Replace `src/proxy.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { getSessionUserFromToken } from "@/lib/auth/session";

const cookieName = process.env.SESSION_COOKIE_NAME ?? "wiki_session";

export async function proxy(request: NextRequest) {
  const user = await getSessionUserFromToken(request.cookies.get(cookieName)?.value);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (user.role !== "admin") return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/bookmarks") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/bookmarks/:path*", "/login", "/signup"],
};
```

- [ ] **Step 6: Add admin bootstrap**

Create `scripts/create-admin.ts`:

```ts
import { hashPassword } from "../src/lib/auth/password";
import { queryOne } from "../src/lib/db/query";
import { pool } from "../src/lib/db/pool";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const username = process.env.ADMIN_USERNAME ?? "admin";

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
}

await queryOne(
  `
  INSERT INTO profiles (email, password_hash, username, display_name, role)
  VALUES ($1, $2, $3, $3, 'admin')
  ON CONFLICT (email) DO UPDATE
  SET password_hash = excluded.password_hash,
      username = excluded.username,
      display_name = excluded.display_name,
      role = 'admin'
  `,
  [email.toLowerCase(), await hashPassword(password), username],
);

await pool.end();
console.log(`Admin ready: ${email}`);
```

- [ ] **Step 7: Verify auth compile path**

Run:

```bash
npm run lint
npm run build
```

Expected: no Supabase auth imports remain in `src/actions/auth.ts` or `src/proxy.ts`; build may still fail on remaining Supabase imports until later tasks.

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth src/actions/auth.ts src/proxy.ts scripts/create-admin.ts
git commit -m "feat: replace supabase auth with local sessions"
```

## Task 3: Port Public Queries to SQL

**Files:**

- Create: `src/queries/post-shape.ts`
- Modify: `src/queries/posts.ts`
- Modify: `src/queries/categories.ts`
- Modify: `src/queries/tags.ts`
- Modify: `src/queries/search.ts`
- Modify: `src/queries/comments.ts`
- Modify: `src/queries/likes.ts`
- Modify: `src/queries/graph.ts`

- [ ] **Step 1: Add shared post row mapper**

Create `src/queries/post-shape.ts`:

```ts
import type { Category, Post, Profile, Tag } from "@/types";

type PostSqlRow = Omit<Post, "categories" | "tags" | "profiles"> & {
  category: Category | null;
  author: Pick<Profile, "username" | "display_name" | "avatar_url"> | null;
  tags: Tag[] | null;
};

export function mapPostRow(row: PostSqlRow): Post {
  return {
    ...row,
    categories: row.category,
    profiles: row.author as Profile | null,
    tags: row.tags ?? [],
  };
}

export const postSelectSql = `
  p.*,
  CASE WHEN c.id IS NULL THEN NULL ELSE jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'slug', c.slug,
    'description', c.description,
    'sort_order', c.sort_order
  ) END AS category,
  jsonb_build_object(
    'username', pr.username,
    'display_name', pr.display_name,
    'avatar_url', pr.avatar_url
  ) AS author,
  COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug,
        'color', t.color,
        'description', t.description
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'::jsonb
  ) AS tags
`;

export const postJoinSql = `
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN profiles pr ON pr.id = p.author_id
  LEFT JOIN post_tags pt ON pt.post_id = p.id
  LEFT JOIN tags t ON t.id = pt.tag_id
`;

export const postGroupSql = "p.id, c.id, pr.id";
```

- [ ] **Step 2: Rewrite `src/queries/posts.ts`**

Use SQL equivalents for:

- `getPublishedPosts(page, pageSize)`: `WHERE p.published = true`, ordered by `p.published_at DESC`, paginated with `LIMIT/OFFSET`, count with `count(*)`.
- `getPostBySlug(slug)`: same joins, `WHERE p.slug = $1 AND p.published = true`.
- `getAllPosts(page, pageSize)`: admin list, no published filter; caller route must be admin-protected.
- `getPostsByTag(tagSlug, page, pageSize)`: `EXISTS` filter against `post_tags` + `tags.slug`.
- `getPostsByCategory(categorySlug, page, pageSize)`: join/filter `categories.slug`.
- `getRecentPosts(limit)`: lightweight select with category object.

Pattern:

```ts
import { cache } from "react";
import { query, queryOne } from "@/lib/db/query";
import type { Post } from "@/types";
import { mapPostRow, postGroupSql, postJoinSql, postSelectSql } from "./post-shape";

export const getPublishedPosts = cache(async (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  const posts = await query<Post>(
    `
    SELECT ${postSelectSql}
    FROM posts p
    ${postJoinSql}
    WHERE p.published = true
    GROUP BY ${postGroupSql}
    ORDER BY p.published_at DESC NULLS LAST
    LIMIT $1 OFFSET $2
    `,
    [pageSize, offset],
  );
  const total = await queryOne<{ count: string }>(
    "SELECT count(*) FROM posts WHERE published = true",
  );
  return { posts: posts.map(mapPostRow), total: Number(total?.count ?? 0), page, pageSize };
});
```

- [ ] **Step 3: Rewrite categories/tags queries**

`src/queries/categories.ts`:

```ts
import { cache } from "react";
import { query } from "@/lib/db/query";
import type { Category } from "@/types";

export const getCategories = cache(async () => {
  return query<Category>(
    "SELECT id, name, slug, description, sort_order FROM categories ORDER BY sort_order ASC, name ASC",
  );
});
```

`src/queries/tags.ts`:

```ts
import { cache } from "react";
import { query } from "@/lib/db/query";
import type { Tag } from "@/types";

export const getTags = cache(async () => {
  return query<Tag>(
    "SELECT id, name, slug, color, description FROM tags ORDER BY name ASC",
  );
});
```

- [ ] **Step 4: Rewrite search query**

`src/queries/search.ts`:

```ts
import { query } from "@/lib/db/query";

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category_id: string | null;
  author_id: string;
  cover_image: string | null;
  reading_time: number;
  view_count: number;
  published_at: string | null;
  rank: number;
}

export async function searchPosts(queryText: string, limit = 8): Promise<SearchResult[]> {
  const trimmed = queryText.trim();
  if (!trimmed) return [];

  return query<SearchResult>(
    `
    SELECT id, slug, title, excerpt, category_id, author_id, cover_image,
           reading_time, view_count, published_at,
           ts_rank(fts, plainto_tsquery('simple', $1)) AS rank
    FROM posts
    WHERE published = true AND fts @@ plainto_tsquery('simple', $1)
    ORDER BY rank DESC, published_at DESC NULLS LAST
    LIMIT $2
    `,
    [trimmed, limit],
  );
}
```

- [ ] **Step 5: Rewrite comments, likes, graph**

Implement the same exported function names already consumed by pages/components. Preserve return shapes in `src/types/index.ts`; query comments with profile joins, likes with aggregate counts and current-user filters where needed, graph with `posts` and `post_links`.

- [ ] **Step 6: Verify public pages**

Run:

```bash
npm run lint
npm run build
```

Expected: no Supabase imports remain in `src/queries/posts.ts`, `src/queries/categories.ts`, `src/queries/tags.ts`, or `src/queries/search.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/queries
git commit -m "feat: port public queries to postgres"
```

## Task 4: Port Mutations and Admin Actions

**Files:**

- Modify: `src/actions/admin.ts`
- Modify: `src/actions/posts.ts`
- Modify: `src/actions/bookmarks.ts`
- Modify: `src/actions/likes.ts`
- Modify: `src/actions/comments.ts`
- Modify: `src/actions/subscriptions.ts`
- Modify: `src/queries/bookmarks.ts`
- Modify: `src/queries/subscribers.ts`

- [ ] **Step 1: Add admin guards to admin mutations**

At the start of every category/tag admin action:

```ts
const admin = await requireAdmin();
void admin;
```

Use `queryOne` for inserts/updates/deletes:

```ts
await queryOne(
  "INSERT INTO categories (name, slug, description, sort_order) VALUES ($1, $2, $3, $4)",
  [name, slug, description || null, sortOrder],
);
```

- [ ] **Step 2: Rewrite post mutations transactionally**

Use `requireAdmin()` in `createPost`, `updatePost`, `deletePost`, and `togglePublish`.

For `createPost`, insert the post and post_tags inside one transaction:

```ts
const post = await transaction(async (client) => {
  const inserted = await client.query<{ id: string }>(
    `
    INSERT INTO posts (
      slug, title, content, excerpt, category_id, author_id,
      cover_image, reading_time, published, published_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
    `,
    [
      slug,
      title,
      content,
      excerpt || null,
      categoryId,
      user.id,
      coverImage,
      Math.round(readingTime(content).minutes),
      published,
      published ? new Date().toISOString() : null,
    ],
  );

  const postId = inserted.rows[0].id;
  for (const tagId of tagIds) {
    await client.query(
      "INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [postId, tagId],
    );
  }
  return { id: postId };
});
```

- [ ] **Step 3: Rewrite bookmarks**

Use `requireUser()`.

Toggle logic:

```sql
DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2 RETURNING id
```

If no row was deleted:

```sql
INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
```

- [ ] **Step 4: Rewrite likes**

Use `requireUser()`.

Toggle logic:

```sql
DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3 RETURNING id
```

If no row was deleted:

```sql
INSERT INTO likes (user_id, target_type, target_id)
VALUES ($1, $2, $3)
ON CONFLICT DO NOTHING
```

- [ ] **Step 5: Rewrite comments**

For authenticated comments use `currentUser()` and insert `author_id`. For guest comments insert `guest_name`, `guest_email`, and null `author_id`.

Deletion must include ownership:

```sql
DELETE FROM comments WHERE id = $1 AND author_id = $2
```

- [ ] **Step 6: Rewrite subscriptions**

For public subscribe:

```sql
INSERT INTO subscriptions (email, is_active, subscribed_at, unsubscribed_at)
VALUES ($1, true, now(), null)
ON CONFLICT (email) DO UPDATE
SET is_active = true,
    subscribed_at = now(),
    unsubscribed_at = null
```

For admin subscriber list use `requireAdmin()`.

- [ ] **Step 7: Verify mutation imports**

Run:

```bash
rg -n "@/lib/supabase|@supabase|publicSupabase|createAdminClient|createClient" src/actions src/queries
npm run lint
npm run build
```

Expected: search returns no Supabase imports in actions/queries.

- [ ] **Step 8: Commit**

```bash
git add src/actions src/queries
git commit -m "feat: port mutations to local postgres"
```

## Task 5: Replace Upload Storage

**Files:**

- Create: `src/lib/storage/local-images.ts`
- Create: `public/uploads/post-images/.gitkeep`
- Modify: `src/app/api/upload/route.ts`

- [ ] **Step 1: Add local image storage helper**

Create `src/lib/storage/local-images.ts`:

```ts
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

const uploadDir = path.join(process.cwd(), "public", "uploads", "post-images");
const maxBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function savePostImage(file: File) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Only PNG, JPEG, WEBP, and GIF images are allowed");
  }

  if (file.size > maxBytes) {
    throw new Error("File size must be under 5MB");
  }

  await fs.mkdir(uploadDir, { recursive: true });

  const extension = extensionForType(file.type);
  const filename = `${crypto.randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, filename), bytes, { flag: "wx" });

  return `/uploads/post-images/${filename}`;
}

function extensionForType(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "png";
}
```

- [ ] **Step 2: Rewrite upload route**

Replace `src/app/api/upload/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/current-user";
import { savePostImage } from "@/lib/storage/local-images";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const url = await savePostImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify upload path**

Run:

```bash
npm run lint
npm run build
```

Expected: upload route no longer imports `createAdminClient`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/storage src/app/api/upload/route.ts public/uploads/post-images/.gitkeep
git commit -m "feat: replace supabase storage with local uploads"
```

## Task 6: Replace Page-Level Supabase Calls

**Files:**

- Modify: `src/app/admin/layout.tsx`
- Modify: `src/app/admin/posts/[id]/edit/page.tsx`
- Modify: `src/app/(main)/blog/[slug]/page.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/api/subscribe/route.ts`

- [ ] **Step 1: Admin layout**

Use `requireAdmin()`:

```ts
import { requireAdmin } from "@/lib/auth/current-user";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
```

Adapt this to preserve the existing JSX wrapper in `src/app/admin/layout.tsx`.

- [ ] **Step 2: Blog detail user state**

Replace inline Supabase `auth.getUser()` and bookmark query with `currentUser()` plus SQL bookmark lookup.

Expected behavior:

- Anonymous users can read published posts.
- Authenticated users get correct `isBookmarked`/liked state.
- Admin still reaches unpublished edit flows through admin pages, not public blog page.

- [ ] **Step 3: Edit page**

Replace direct Supabase post query with a SQL helper such as `getPostForEdit(postId)` that requires admin before fetching.

- [ ] **Step 4: Sitemap**

Use:

```sql
SELECT slug, updated_at FROM posts WHERE published = true ORDER BY published_at DESC
```

- [ ] **Step 5: Subscribe route**

Use the subscription SQL from Task 4 and keep the same JSON response contract.

- [ ] **Step 6: Verify App Router build**

Run:

```bash
rg -n "@/lib/supabase|@supabase|publicSupabase|createAdminClient|createClient" src/app src/components
npm run lint
npm run build
```

Expected: no Supabase imports remain in app routes or components.

- [ ] **Step 7: Commit**

```bash
git add src/app
git commit -m "feat: remove page-level supabase calls"
```

## Task 7: Remove Supabase Dependencies and Legacy Files

**Files:**

- Delete: `src/lib/supabase/server.ts`
- Delete: `src/lib/supabase/client.ts`
- Delete: `src/lib/supabase/public.ts`
- Delete: `src/lib/supabase/admin.ts`
- Delete: `supabase/`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Remove packages**

Run:

```bash
npm uninstall @supabase/ssr @supabase/supabase-js
```

Expected: `package.json` and `package-lock.json` no longer contain Supabase packages.

- [ ] **Step 2: Delete Supabase client files and migrations**

Delete:

```bash
src/lib/supabase
supabase
```

- [ ] **Step 3: Update docs**

Update `README.md` and `CLAUDE.md` to describe:

- Local PostgreSQL setup with `DATABASE_URL`
- `npm run db:migrate`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`, `npm run admin:create`
- Uploads stored under `public/uploads/post-images`
- Auth/session backed by `profiles` and `sessions`

- [ ] **Step 4: Verify Supabase is gone**

Run:

```bash
rg -n "supabase|@supabase|SUPABASE|NEXT_PUBLIC_SUPABASE|SERVICE_ROLE" .
npm run lint
npm run build
```

Expected: only historical docs in git history; current workspace has no Supabase references except this plan if retained.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json README.md CLAUDE.md
git add -u src/lib/supabase supabase
git commit -m "chore: remove supabase dependencies"
```

## Task 8: Local End-to-End Verification

**Files:**

- No production source changes expected unless verification finds defects.

- [ ] **Step 1: Prepare local database**

Start PostgreSQL locally and create the database:

```bash
createdb wiki_platform
npm run db:migrate
```

Expected: all migrations applied.

- [ ] **Step 2: Create admin**

Run:

```bash
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="change-me-now"
$env:ADMIN_USERNAME="admin"
npm run admin:create
```

Expected: `Admin ready: admin@example.com`.

- [ ] **Step 3: Run app**

Run:

```bash
npm run dev
```

Expected: Next dev server starts.

- [ ] **Step 4: Browser smoke test**

Verify:

- `/` renders published content or empty state without errors.
- `/login` accepts the admin account.
- `/admin/dashboard` redirects unauthenticated users to `/login`.
- Admin can create category, tag, and post.
- Admin can upload a post image and receives a `/uploads/post-images/...` URL.
- Public `/blog/[slug]` renders the published post.
- Authenticated user can bookmark and like.
- Guest comment can be submitted when guest name is present.
- `/api/rss`, `/api/search`, `/api/subscribe`, and `/sitemap.xml` work.

- [ ] **Step 5: Final static checks**

Run:

```bash
rg -n "supabase|@supabase|SUPABASE|NEXT_PUBLIC_SUPABASE|SERVICE_ROLE" .
npm run lint
npm run build
```

Expected: no runtime Supabase references and production build succeeds.

- [ ] **Step 6: Commit fixes**

If verification required fixes:

```bash
git add .
git commit -m "fix: complete local postgres migration"
```

## Rollback Strategy

- Each task is independently committed.
- If auth migration breaks, revert Task 2 and keep Supabase auth temporarily while Task 1 remains harmless.
- If SQL query migration breaks public pages, revert Task 3 only.
- If storage migration breaks uploads, revert Task 5 only.
- Do not delete `supabase/` or uninstall Supabase packages until Task 7, after all runtime code has moved.

## Self-Review

- Spec coverage: the plan removes Supabase Auth, Supabase database access, Supabase Storage, Supabase env vars, Supabase migrations, and Supabase dependencies.
- Security coverage: every mutation and protected route is guarded by `requireUser()` or `requireAdmin()`; Proxy remains a redirect optimization only.
- Next.js 16 coverage: uses `src/proxy.ts`, App Router Route Handlers, and Server Actions according to local docs.
- Data model coverage: preserves current domain tables and return shapes while replacing `auth.users` and RLS with local `profiles`, `sessions`, and explicit authorization.
- Test coverage: includes lint/build checks, import scans, migration checks, and manual browser smoke tests.
