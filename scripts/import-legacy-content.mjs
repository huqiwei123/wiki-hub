import childProcess from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import pg from "pg";
import readingTime from "reading-time";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });

function gitShow(file) {
  return childProcess.execFileSync("git", ["show", `HEAD:${file}`], {
    encoding: "utf8",
  });
}

function evaluateLegacySeed() {
  const seed = gitShow("src/lib/seed.ts");
  const seedArticles = gitShow("src/lib/seed-articles.ts");

  const seedDataSource = seed.slice(
    seed.indexOf("const categories ="),
    seed.indexOf("async function seed()"),
  );
  const articleDataSource = seedArticles.slice(
    seedArticles.indexOf("const articles ="),
    seedArticles.indexOf("async function main()"),
  );

  const seedContext = {};
  vm.runInNewContext(
    `${seedDataSource}; result = { categories, tags, posts, postLinks };`,
    seedContext,
  );

  const articleContext = {};
  vm.runInNewContext(`${articleDataSource}; result = { articles };`, articleContext);

  return {
    categories: seedContext.result.categories,
    tags: seedContext.result.tags,
    posts: [...seedContext.result.posts, ...articleContext.result.articles],
    postLinks: seedContext.result.postLinks,
  };
}

const coverImages = new Map([
  ["deep-dive", "typescript-decorators.png"],
  ["scalable-apis", "backend-supabase.png"],
  ["server-components", "react-server-components.png"],
]);

async function copyCoverImage(slug) {
  const sourceName = coverImages.get(slug);
  if (!sourceName) return null;

  const sourcePath = path.join(process.cwd(), "public", "generated", sourceName);
  const extension = path.extname(sourceName);
  const targetName = `${slug}${extension}`;
  const targetDir = path.join(process.cwd(), "public", "uploads", "post-images");
  const targetPath = path.join(targetDir, targetName);

  await fs.mkdir(targetDir, { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
  return `/uploads/post-images/${targetName}`;
}

async function upsertLegacyContent() {
  const { categories, tags, posts, postLinks } = evaluateLegacySeed();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const admin = await client.query(
      "SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1",
    );
    const authorId = admin.rows[0]?.id;
    if (!authorId) throw new Error("No admin profile found");

    const categoryIds = new Map();
    for (const category of categories) {
      const result = await client.query(
        `
        INSERT INTO categories (name, slug, description, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE
        SET name = excluded.name,
            description = excluded.description,
            sort_order = excluded.sort_order
        RETURNING id
        `,
        [category.name, category.slug, category.description ?? null, category.sort_order ?? 0],
      );
      categoryIds.set(category.slug, result.rows[0].id);
    }

    const tagIds = new Map();
    for (const tag of tags) {
      const result = await client.query(
        `
        INSERT INTO tags (name, slug, color, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE
        SET name = excluded.name,
            color = excluded.color,
            description = excluded.description
        RETURNING id
        `,
        [tag.name, tag.slug, tag.color ?? null, tag.description ?? null],
      );
      tagIds.set(tag.slug, result.rows[0].id);
    }

    const postIds = new Map();
    for (const post of posts) {
      const coverImage = await copyCoverImage(post.slug);
      const categoryId = categoryIds.get(post.category_slug) ?? null;
      const minutes = post.reading_time ?? Math.max(1, Math.round(readingTime(post.content).minutes));
      const result = await client.query(
        `
        INSERT INTO posts (
          slug, title, excerpt, content, published, category_id, author_id,
          cover_image, reading_time, published_at
        )
        VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, COALESCE($9::timestamptz, now()))
        ON CONFLICT (slug) DO UPDATE
        SET title = excluded.title,
            excerpt = excluded.excerpt,
            content = excluded.content,
            published = true,
            category_id = excluded.category_id,
            author_id = excluded.author_id,
            cover_image = COALESCE(excluded.cover_image, posts.cover_image),
            reading_time = excluded.reading_time,
            published_at = COALESCE(posts.published_at, excluded.published_at)
        RETURNING id
        `,
        [
          post.slug,
          post.title,
          post.excerpt ?? null,
          post.content,
          categoryId,
          authorId,
          coverImage,
          minutes,
          post.published_at ?? null,
        ],
      );

      const postId = result.rows[0].id;
      postIds.set(post.slug, postId);

      await client.query("DELETE FROM post_tags WHERE post_id = $1", [postId]);
      for (const tagSlug of post.tag_slugs ?? []) {
        const tagId = tagIds.get(tagSlug);
        if (!tagId) continue;
        await client.query(
          "INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [postId, tagId],
        );
      }
    }

    for (const link of postLinks) {
      const sourceId = postIds.get(link.source);
      const targetId = postIds.get(link.target);
      if (!sourceId || !targetId) continue;

      await client.query(
        `
        INSERT INTO post_links (source_post_id, target_post_id, target_slug)
        SELECT $1, $2, $3
        WHERE NOT EXISTS (
          SELECT 1 FROM post_links WHERE source_post_id = $1 AND target_post_id = $2
        )
        `,
        [sourceId, targetId, link.target],
      );
    }

    await client.query("COMMIT");

    console.log(`Imported ${categories.length} categories`);
    console.log(`Imported ${tags.length} tags`);
    console.log(`Imported ${posts.length} posts`);
    console.log(`Copied ${coverImages.size} cover images`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

await upsertLegacyContent();
