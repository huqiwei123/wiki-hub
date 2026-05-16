import type { Category, Post, Profile, Tag } from "@/types";

export type PostSqlRow = Omit<Post, "categories" | "tags" | "profiles"> & {
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
  CASE WHEN pr.id IS NULL THEN NULL ELSE jsonb_build_object(
    'username', pr.username,
    'display_name', pr.display_name,
    'avatar_url', pr.avatar_url
  ) END AS author,
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
