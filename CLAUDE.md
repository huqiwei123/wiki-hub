# WikiHub — Personal Knowledge Base & Blog Platform

Next.js 16 full-stack blog with bidirectional links, knowledge graph, and social features. Supabase backend, React Server Components, static-generated UI pages.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + `tw-animate-css` + `@tailwindcss/typography` |
| Components | shadcn/ui (copy-paste, not dependency) + `lucide-react` |
| Database | Supabase (Postgres 15) — tables not yet created |
| Auth | `@supabase/ssr` — cookie-based SSR, middleware session refresh |
| MDX | `next-mdx-remote/rsc` + `remark-gfm` + `rehype-pretty-code` (Shiki) |
| 3D BG | `three` — dynamically imported, interactive Rubik's cube background |
| Theme | Custom `ThemeProvider` — `next-themes` removed due to `<script>` tag incompatibility with Next.js 16 |
| Editor | CodeMirror 6 (planned, not yet implemented) |

## Build & Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # start production server
```

The app builds cleanly. `npm run build` passes TypeScript and generates all static pages.

## Project Structure

```
src/
├── app/
│   ├── (main)/              # Public pages (layout group)
│   │   ├── page.tsx                   # Home — hero, featured articles, categories, graph preview
│   │   ├── blog/page.tsx              # Article list with filter bar
│   │   ├── blog/[slug]/page.tsx       # Article detail (MDX render)
│   │   ├── tags/page.tsx              # Tag cloud + all tags grid
│   │   ├── categories/page.tsx        # Category cards
│   │   ├── graph/page.tsx             # Knowledge graph (placeholder UI)
│   │   ├── about/page.tsx             # About page with features + tech stack
│   │   └── layout.tsx                 # Main layout: DynamicBackground + Header + content
│   ├── (auth)/              # Auth route group
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── admin/               # Admin dashboard (behind auth + role check)
│   │   ├── layout.tsx                 # Sidebar nav + auth guard
│   │   ├── dashboard/page.tsx         # Stats + post list with publish/delete
│   │   ├── posts/new/page.tsx         # Create post form
│   │   └── posts/[id]/edit/page.tsx   # Edit post form
│   ├── layout.tsx                     # Root layout: fonts, ThemeProvider, metadata
│   ├── sitemap.ts
│   └── globals.css                    # Tailwind, CSS vars, glass/dynamic utilities, animations
├── components/
│   ├── ui/                  # shadcn/ui primitives (button, badge, card, input, textarea, sheet, dialog, etc.)
│   ├── blog/post-card.tsx   # ArticleCard component (unused — superseded by wikihub/ui)
│   ├── layout/
│   │   ├── container.tsx              # Max-width wrapper
│   │   ├── header.tsx                 # Sticky header with nav + search placeholder + ThemeToggle
│   │   ├── site-footer.tsx            # Footer with links + newsletter form
│   │   └── dynamic-background.tsx     # Three.js 3D Rubik's cube animated background
│   ├── mdx/mdx-content.tsx  # MDXRemote wrapper with prose styling
│   ├── theme/
│   │   ├── theme-provider.tsx         # Custom ThemeContext + localStorage persistence
│   │   └── theme-toggle.tsx           # Sun/Moon toggle button
│   └── wikihub/ui.tsx       # Reusable UI blocks: PageHero, SectionHeader, ArticleCard,
│                              #   CompactCategoryCard, FilterButton, SearchBox, GraphPlaceholder
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client (anon key, RLS)
│   │   ├── server.ts        # Server client (anon key + cookie auth, RLS)
│   │   ├── admin.ts         # Admin client (service role, bypasses RLS)
│   │   └── public.ts        # Public readonly client (anon key, no auth, 900ms timeout)
│   ├── mdx/plugins.ts       # remark + rehype plugin configuration
│   ├── static-content.ts    # Mock data for static UI pages (articles, categories, tags, graphStats)
│   └── utils.ts             # cn() — clsx + tailwind-merge
├── actions/
│   ├── auth.ts              # login, signup, logout Server Actions
│   └── posts.ts             # createPost, updatePost, deletePost, togglePublish
├── queries/
│   ├── posts.ts             # getPublishedPosts, getPostBySlug, getAllPosts, getPostsByTag,
│   │                         #   getPostsByCategory, getRecentPosts — all wrapped in unstable_cache
│   ├── categories.ts        # getAllCategories, getCategoryBySlug
│   └── tags.ts              # getAllTags
├── types/index.ts           # Profile, Category, Tag, Post, PostLink, Comment, Bookmark, Subscription
├── config/site.ts           # siteConfig: name, description, nav links, author
└── middleware.ts            # Auth session refresh + route protection (deprecated → proxy)
```

## Key Architecture Decisions

### Supabase Clients (3-tier)

- **`client.ts`** — Browser: `createBrowserClient`, used in client components
- **`server.ts`** — Server: `createServerClient` + cookies, used in Server Components & Server Actions
- **`admin.ts`** — Admin: `createClient` with service role key, bypasses RLS
- **`public.ts`** — Readonly: `createClient` with anon key + `persistSession: false` + 900ms abort timeout, used by cached query functions

### Custom Theme System

`next-themes` was incompatible with Next.js 16 (injects `<script>` tags inside React components). Replaced with custom `ThemeProvider` using:
- React `createContext` + `useContext` for theme state
- `localStorage` for persistence
- `matchMedia("(prefers-color-scheme: dark)")` for system theme detection
- `useSyncExternalStore` in toggle for hydration safety

### Static Content Layer

`src/lib/static-content.ts` provides mock data (articles, categories, tags, graphStats) for all public pages. This means the frontend renders correctly even though database tables aren't yet created on Supabase. When the database is ready, pages that use query functions (`blog/[slug]`, admin/*) will fetch real data.

### Caching Strategy

All query functions use `next/cache` `unstable_cache` with 60-second revalidation and 900ms abort timeout:
```ts
export const getAllCategories = unstable_cache(
  async () => { /* query with abortSignal */ },
  ["all-categories"],
  { revalidate: 60 }
);
```

## Database (Migrations Exist, Not Yet Run)

**Project ref:** `wnxztcrtksiuhwbyctd` (Supabase dashboard: https://supabase.com/dashboard/project/wnxztcrtksiuhwbyctd)

3 migration files in `supabase/migrations/` need to be executed via SQL Editor:

1. **`001_create_profiles.sql`** — `profiles` table (extends `auth.users`), auto-create trigger on signup, RLS
2. **`002_create_categories_tags.sql`** — `categories` + `tags` tables, admin-only write RLS
3. **`003_create_posts.sql`** — `posts` table with `fts` tsvector generated column (GIN index), `post_tags` junction, `updated_at` trigger, RLS

Environment: `SUPABASE_SERVICE_ROLE_KEY` is empty in `.env.local` — admin client won't work until set.

## Route Protection

**middleware.ts** (deprecated, should become `proxy.ts` per Next.js 16):
- Refreshes Supabase auth session via cookies
- Protects `/admin/*` — redirects to `/login` if no user, to `/` if not admin
- Protects `/bookmarks` — redirects to `/login` if no user
- Redirects logged-in users away from `/login` and `/signup`

## Pending Work (Phase 1 Complete, Phase 2+ Remaining)

- [ ] Run database migrations on Supabase
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [ ] CodeMirror editor for admin post write/edit pages
- [ ] Bidirectional links: `remark-wiki-links` plugin + `post_links` table
- [ ] D3.js knowledge graph (ForceGraph page is static placeholder)
- [ ] Full-text search with `cmdk` command palette (`Cmd+K`)
- [ ] Comments with Supabase Realtime
- [ ] Bookmarks, likes, subscriptions
- [ ] RSS feed, dynamic OG images
- [ ] Move `middleware.ts` → `proxy.ts` (Next.js 16 deprecation)
