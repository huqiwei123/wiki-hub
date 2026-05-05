import { createClient } from "@supabase/supabase-js";
import readingTime from "reading-time";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey || serviceRoleKey === "your-service-role-key") {
  console.error("SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const categories = [
  { name: "Development", slug: "development", description: "Programming tutorials and development best practices", sort_order: 1 },
  { name: "Infrastructure", slug: "infrastructure", description: "Cloud, DevOps, and infrastructure guides", sort_order: 2 },
  { name: "Frontend Development", slug: "frontend", description: "UI/UX, React, Next.js, and frontend patterns", sort_order: 3 },
  { name: "Artificial Intelligence", slug: "ai", description: "LLM, machine learning, and AI engineering", sort_order: 4 },
  { name: "Security", slug: "security", description: "Cybersecurity, encryption, and privacy", sort_order: 5 },
  { name: "Mobile Development", slug: "mobile", description: "iOS, Android, Flutter, and React Native", sort_order: 6 },
];

const tags = [
  { name: "TypeScript", slug: "typescript", color: "#2563eb" },
  { name: "React", slug: "react", color: "#059669" },
  { name: "Next.js", slug: "nextjs", color: "#dc2626" },
  { name: "LLM", slug: "llm", color: "#f97316" },
  { name: "PostgreSQL", slug: "postgresql", color: "#7c3aed" },
  { name: "Python", slug: "python", color: "#16a34a" },
  { name: "AWS", slug: "aws", color: "#ca8a04" },
  { name: "Docker", slug: "docker", color: "#0891b2" },
  { name: "Kubernetes", slug: "kubernetes", color: "#c026d3" },
  { name: "Rust", slug: "rust", color: "#ea580c" },
  { name: "Vue", slug: "vue", color: "#0369a1" },
  { name: "CSS", slug: "css", color: "#e11d48" },
  { name: "LangChain", slug: "langchain", color: "#6366f1" },
  { name: "Go", slug: "go", color: "#06b6d4" },
  { name: "Prompt Engineering", slug: "prompt-engineering", color: "#f59e0b" },
  { name: "Flutter", slug: "flutter", color: "#8b5cf6" },
];

const posts = [
  {
    slug: "deep-dive",
    title: "Deep Dive into TypeScript 5.0 Decorators",
    excerpt: "Learn how the new ECMAScript decorators standard transforms TypeScript application architecture.",
    category_slug: "development",
    tag_slugs: ["typescript"],
    content: `## Introduction

TypeScript 5.0 introduces the long-awaited ECMAScript decorators standard, replacing the older experimental decorators that required the \`experimentalDecorators\` flag.

## Key Features

### Class Decorators

The new decorators use a simpler, standards-compliant syntax:

\`\`\`typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
}
\`\`\`

### Auto-Accessor Fields

The \`accessor\` keyword is a key addition that makes field decorators truly useful:

\`\`\`typescript
class Person {
  @logged accessor name: string;
  constructor(name: string) {
    this.name = name;
  }
}
\`\`\`

## Migration Guide

Moving from experimental decorators to the new standard requires several changes. See the [[scalable-apis|Scalable APIs guide]] for backend migration strategies.

## Related Topics

- [[server-components|Server Components]] — how decorators fit into the React Server Components model
`,
  },
  {
    slug: "scalable-apis",
    title: "Building Scalable APIs with PostgreSQL and Supabase",
    excerpt: "A practical guide to schema design, row level security, and production-ready API patterns.",
    category_slug: "infrastructure",
    tag_slugs: ["postgresql"],
    content: `## Architecture Overview

Building production APIs requires careful consideration of database design, authentication, and performance.

## Schema Design

Good schema design starts with understanding your data relationships:

- Use UUIDs for primary keys
- Normalize data appropriately
- Add proper indexing

## Row Level Security

Supabase provides powerful RLS policies that let you define security at the database level:

\`\`\`sql
CREATE POLICY "Users can view own data"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
\`\`\`

## Integration with [[server-components|Server Components]]

React Server Components pair perfectly with Supabase's server-side client for efficient data fetching.

See also: [[deep-dive|TypeScript 5.0 Decorators]] for type-safe API patterns.
`,
  },
  {
    slug: "server-components",
    title: "Server Components: The Complete Mental Model",
    excerpt: "Understand how React Server Components reshape routing, data loading, and rendering.",
    category_slug: "frontend",
    tag_slugs: ["react", "nextjs"],
    content: `## The Mental Model

React Server Components fundamentally change how we think about component architecture.

## Data Flow

Server Components can directly access databases, file systems, and other server-side resources:

\`\`\`typescript
async function PostList() {
  const posts = await db.query('SELECT * FROM posts');
  return (
    <ul>
      {posts.map(post => <PostCard key={post.id} {...post} />)}
    </ul>
  );
}
\`\`\`

## Client Boundaries

Use \`"use client"\` directives sparingly. See [[scalable-apis|Building Scalable APIs]] for backend patterns that complement Server Components.

## Performance

Server Components reduce bundle size by keeping heavy dependencies server-side.

Related: [[deep-dive|TypeScript 5.0 Decorators]] for type-safe Server Component patterns.
`,
  },
];

const postLinks = [
  { source: "deep-dive", target: "scalable-apis" },
  { source: "scalable-apis", target: "server-components" },
  { source: "server-components", target: "deep-dive" },
  { source: "deep-dive", target: "server-components" },
];

async function seed() {
  console.log("Seeding database...\n");

  // 1. Update admin profile role
  console.log("1/6 Updating admin profile...");
  const { data: profiles } = await admin.from("profiles").select("id, username").limit(1).single();
  if (profiles) {
    await admin.from("profiles").update({ role: "admin" }).eq("id", profiles.id);
    console.log(`   Updated ${profiles.username} to admin role`);
  } else {
    console.log("   No profiles found, skipping");
  }

  // 2. Insert categories
  console.log("\n2/6 Inserting categories...");
  const { data: catData, error: catErr } = await admin
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select("id, slug");
  if (catErr) console.error("   Error:", catErr.message);
  else console.log(`   Inserted ${catData.length} categories`);

  const catMap = new Map(catData?.map((c) => [c.slug, c.id]) ?? []);

  // 3. Insert tags
  console.log("\n3/6 Inserting tags...");
  const { data: tagData, error: tagErr } = await admin
    .from("tags")
    .upsert(tags, { onConflict: "slug" })
    .select("id, slug");
  if (tagErr) console.error("   Error:", tagErr.message);
  else console.log(`   Inserted ${tagData.length} tags`);

  const tagMap = new Map(tagData?.map((t) => [t.slug, t.id]) ?? []);

  // 4. Insert posts
  console.log("\n4/6 Inserting posts...");
  const adminUser = await admin.from("profiles").select("id").eq("role", "admin").limit(1).single();
  const authorId = adminUser.data?.id;

  const postIds: Record<string, string> = {};
  for (const p of posts) {
    const categoryId = catMap.get(p.category_slug) ?? null;
    const { data: postData, error: postErr } = await admin
      .from("posts")
      .upsert(
        {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          published: true,
          published_at: new Date().toISOString(),
          category_id: categoryId,
          author_id: authorId,
          reading_time: Math.max(1, Math.round(readingTime(p.content).minutes)),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (postErr) {
      console.error(`   Error inserting ${p.slug}:`, postErr.message);
    } else if (postData) {
      postIds[p.slug] = postData.id;
      console.log(`   Inserted: ${p.title}`);
    }
  }

  // 5. Insert post_tags
  console.log("\n5/6 Inserting post_tags...");
  let tagCount = 0;
  for (const p of posts) {
    const postId = postIds[p.slug];
    if (!postId) continue;
    const rows = p.tag_slugs
      .map((ts) => tagMap.get(ts))
      .filter(Boolean)
      .map((tagId) => ({ post_id: postId, tag_id: tagId }));
    if (rows.length > 0) {
      await admin.from("post_tags").upsert(rows, { onConflict: "post_id,tag_id" });
      tagCount += rows.length;
    }
  }
  console.log(`   Inserted ${tagCount} post_tag links`);

  // 6. Insert post_links
  console.log("\n6/6 Inserting post_links...");
  let linkCount = 0;
  for (const link of postLinks) {
    const sourceId = postIds[link.source];
    const targetId = postIds[link.target];
    if (!sourceId || !targetId) continue;
    await admin.from("post_links").upsert(
      {
        source_post_id: sourceId,
        target_post_id: targetId,
        target_slug: link.target,
      },
      { onConflict: "source_post_id,target_post_id" }
    );
    linkCount++;
  }
  console.log(`   Inserted ${linkCount} post links`);

  console.log("\nSeeding complete!");
}

seed().catch(console.error);
