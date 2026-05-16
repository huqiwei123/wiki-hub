import { cache } from "react";
import { query } from "@/lib/db/query";
import type { Tag } from "@/types";

export const getAllTags = cache(async () => {
  return query<Tag & { post_count: number }>(
    `
    SELECT t.id, t.name, t.slug, t.color, t.description,
           count(p.id)::int AS post_count
    FROM tags t
    LEFT JOIN post_tags pt ON pt.tag_id = t.id
    LEFT JOIN posts p ON p.id = pt.post_id AND p.published = true
    GROUP BY t.id
    ORDER BY t.name ASC
    `,
  );
});
