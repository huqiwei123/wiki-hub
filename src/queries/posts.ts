import { cache } from "react";
import { query, queryOne } from "@/lib/db/query";
import type { Post } from "@/types";
import { mapPostRow, type PostSqlRow, postGroupSql, postJoinSql, postSelectSql } from "./post-shape";

export const getPublishedPosts = cache(async (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;

  const rows = await query<PostSqlRow>(
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

  return {
    posts: rows.map(mapPostRow),
    total: Number(total?.count ?? 0),
    page,
    pageSize,
  };
});

export const getPostBySlug = cache(async (slug: string) => {
  const row = await queryOne<PostSqlRow>(
    `
    SELECT ${postSelectSql}
    FROM posts p
    ${postJoinSql}
    WHERE p.slug = $1 AND p.published = true
    GROUP BY ${postGroupSql}
    `,
    [slug],
  );

  if (!row) throw new Error("Post not found");
  return mapPostRow(row);
});

export async function getPostForEdit(postId: string) {
  return queryOne<Post & { tag_ids: string[] }>(
    `
    SELECT p.*,
           COALESCE(array_agg(pt.tag_id) FILTER (WHERE pt.tag_id IS NOT NULL), ARRAY[]::uuid[]) AS tag_ids
    FROM posts p
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    WHERE p.id = $1
    GROUP BY p.id
    `,
    [postId],
  );
}

export async function getAllPosts(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  const rows = await query<PostSqlRow>(
    `
    SELECT ${postSelectSql}
    FROM posts p
    ${postJoinSql}
    GROUP BY ${postGroupSql}
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [pageSize, offset],
  );

  const total = await queryOne<{ count: string }>("SELECT count(*) FROM posts");

  return {
    posts: rows.map(mapPostRow),
    total: Number(total?.count ?? 0),
    page,
    pageSize,
  };
}

export const getPostsByTag = cache(async (tagSlug: string, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;

  const rows = await query<PostSqlRow>(
    `
    SELECT ${postSelectSql}
    FROM posts p
    ${postJoinSql}
    WHERE p.published = true
      AND EXISTS (
        SELECT 1
        FROM post_tags filter_pt
        JOIN tags filter_t ON filter_t.id = filter_pt.tag_id
        WHERE filter_pt.post_id = p.id AND filter_t.slug = $1
      )
    GROUP BY ${postGroupSql}
    ORDER BY p.published_at DESC NULLS LAST
    LIMIT $2 OFFSET $3
    `,
    [tagSlug, pageSize, offset],
  );

  const total = await queryOne<{ count: string }>(
    `
    SELECT count(DISTINCT p.id)
    FROM posts p
    JOIN post_tags pt ON pt.post_id = p.id
    JOIN tags t ON t.id = pt.tag_id
    WHERE p.published = true AND t.slug = $1
    `,
    [tagSlug],
  );

  return {
    posts: rows.map(mapPostRow),
    total: Number(total?.count ?? 0),
    page,
    pageSize,
  };
});

export const getPostsByCategory = cache(async (categorySlug: string, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;

  const rows = await query<PostSqlRow>(
    `
    SELECT ${postSelectSql}
    FROM posts p
    ${postJoinSql}
    WHERE p.published = true AND c.slug = $1
    GROUP BY ${postGroupSql}
    ORDER BY p.published_at DESC NULLS LAST
    LIMIT $2 OFFSET $3
    `,
    [categorySlug, pageSize, offset],
  );

  const total = await queryOne<{ count: string }>(
    `
    SELECT count(*)
    FROM posts p
    JOIN categories c ON c.id = p.category_id
    WHERE p.published = true AND c.slug = $1
    `,
    [categorySlug],
  );

  return {
    posts: rows.map(mapPostRow),
    total: Number(total?.count ?? 0),
    page,
    pageSize,
  };
});

export const getRecentPosts = cache(async (limit = 5) => {
  return query<Pick<Post, "id" | "slug" | "title" | "excerpt" | "published_at" | "reading_time" | "cover_image" | "categories">>(
    `
    SELECT p.id, p.slug, p.title, p.excerpt, p.published_at, p.reading_time, p.cover_image,
           CASE WHEN c.id IS NULL THEN NULL ELSE jsonb_build_object(
             'id', c.id,
             'name', c.name,
             'slug', c.slug,
             'description', c.description,
             'sort_order', c.sort_order
           ) END AS categories
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.published = true
    ORDER BY p.published_at DESC NULLS LAST
    LIMIT $1
    `,
    [limit],
  );
});
