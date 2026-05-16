import { cache } from "react";
import { query } from "@/lib/db/query";
import type { Category } from "@/types";

export const getAllCategories = cache(async () => {
  return query<Category & { post_count: number }>(
    `
    SELECT c.id, c.name, c.slug, c.description, c.sort_order,
           count(p.id)::int AS post_count
    FROM categories c
    LEFT JOIN posts p ON p.category_id = c.id AND p.published = true
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC
    `,
  );
});
