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
