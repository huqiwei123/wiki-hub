import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select("posts(id, slug, title, excerpt, cover_image, reading_time, published_at, categories(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .filter((b: any) => b.posts)
    .map((b: any) => ({
      id: b.posts.id,
      slug: b.posts.slug,
      title: b.posts.title,
      excerpt: b.posts.excerpt,
      cover_image: b.posts.cover_image,
      reading_time: b.posts.reading_time,
      published_at: b.posts.published_at,
      category: b.posts.categories?.name ?? null,
    }));
}

export async function isBookmarked(postId: string): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  return !!data;
}
