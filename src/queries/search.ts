import { publicSupabase, withTimeoutSignal } from "@/lib/supabase/public";

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

export async function searchPosts(query: string, limit = 8): Promise<SearchResult[]> {
  const timeout = withTimeoutSignal();
  try {
    const { data, error } = await publicSupabase
      .rpc("search_posts", { search_query: query, limit_count: limit })
      .abortSignal(timeout.signal);

    if (error) return [];
    return (data as SearchResult[]) ?? [];
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
}
