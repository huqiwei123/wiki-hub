import { publicSupabase, withTimeoutSignal } from "@/lib/supabase/public";
import type { Tag } from "@/types";
import { cache } from "react";

export const getAllTags = cache(async () => {
  const timeout = withTimeoutSignal();
  try {
    const { data, error } = await publicSupabase
      .from("tags")
      .select("*, post_count:post_tags(count)")
      .order("name", { ascending: true })
      .abortSignal(timeout.signal);

    if (error || !data) return [];
    return (data as Array<Tag & { post_count: Array<{ count: number }> }>).map((tag) => ({
      ...tag,
      post_count: tag.post_count?.[0]?.count ?? 0,
    }));
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
});
