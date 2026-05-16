import { cache } from "react";
import { query, queryOne } from "@/lib/db/query";

export interface PostLinkEdge {
  source: string;
  target: string;
  sourceTitle: string;
  targetTitle: string;
}

export async function getPostLinks(slug: string): Promise<PostLinkEdge[]> {
  const post = await queryOne<{ id: string }>(
    "SELECT id FROM posts WHERE slug = $1 AND published = true",
    [slug],
  );

  if (!post) return [];

  return query<PostLinkEdge>(
    `
    SELECT source.slug AS source,
           COALESCE(target.slug, pl.target_slug) AS target,
           source.title AS "sourceTitle",
           COALESCE(target.title, pl.target_slug) AS "targetTitle"
    FROM post_links pl
    JOIN posts source ON source.id = pl.source_post_id
    LEFT JOIN posts target ON target.id = pl.target_post_id
    WHERE pl.source_post_id = $1 OR pl.target_post_id = $1
    `,
    [post.id],
  );
}

export const getBacklinks = cache(async (postId: string): Promise<Array<{ slug: string; title: string }>> => {
  return query<{ slug: string; title: string }>(
    `
    SELECT p.slug, p.title
    FROM post_links pl
    JOIN posts p ON p.id = pl.source_post_id
    WHERE pl.target_post_id = $1 AND p.published = true
    ORDER BY p.published_at DESC NULLS LAST
    `,
    [postId],
  );
});

export const getForwardLinks = cache(async (postId: string): Promise<Array<{ slug: string; title: string }>> => {
  return query<{ slug: string; title: string }>(
    `
    SELECT COALESCE(p.slug, pl.target_slug) AS slug,
           COALESCE(p.title, pl.target_slug) AS title
    FROM post_links pl
    LEFT JOIN posts p ON p.id = pl.target_post_id
    WHERE pl.source_post_id = $1
    ORDER BY title ASC
    `,
    [postId],
  );
});

export async function getAllGraphData() {
  const [posts, links] = await Promise.all([
    query<{ slug: string; title: string; category: string | null }>(
      `
      SELECT p.slug, p.title, c.name AS category
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.published = true
      `,
    ),
    query<{ source: string | null; target: string | null }>(
      `
      SELECT source.slug AS source,
             COALESCE(target.slug, pl.target_slug) AS target
      FROM post_links pl
      LEFT JOIN posts source ON source.id = pl.source_post_id AND source.published = true
      LEFT JOIN posts target ON target.id = pl.target_post_id AND target.published = true
      `,
    ),
  ]);

  return {
    nodes: posts.map((post) => ({
      id: post.slug,
      label: post.title,
      group: post.category ?? "Uncategorized",
    })),
    edges: links
      .filter((link): link is { source: string; target: string } => Boolean(link.source && link.target))
      .map((link) => ({
        source: link.source,
        target: link.target,
      })),
  };
}
