import { currentUser } from "@/lib/auth/current-user";
import { query, queryOne } from "@/lib/db/query";

export interface BookmarkedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  reading_time: number;
  published_at: string | null;
  category: string | null;
}

export async function getBookmarks(): Promise<BookmarkedPost[]> {
  const user = await currentUser();
  if (!user) return [];

  return query<BookmarkedPost>(
    `
    SELECT p.id, p.slug, p.title, p.excerpt, p.cover_image, p.reading_time,
           p.published_at, c.name AS category
    FROM bookmarks b
    JOIN posts p ON p.id = b.post_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE b.user_id = $1 AND p.published = true
    ORDER BY b.created_at DESC
    `,
    [user.id],
  );
}

export async function isBookmarked(postId: string): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;

  const row = await queryOne<{ id: string }>(
    "SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2",
    [user.id, postId],
  );

  return Boolean(row);
}
