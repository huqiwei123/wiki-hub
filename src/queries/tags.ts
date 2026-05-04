import { publicSupabase, withTimeoutSignal } from "@/lib/supabase/public";
import type { Tag } from "@/types";
import { unstable_cache } from "next/cache";

export const getAllTags = unstable_cache(async () => {
  const timeout = withTimeoutSignal();
  try {
    const { data, error } = await publicSupabase
      .from("tags")
      .select("*, post_count:post_tags(count)")
      .order("name", { ascending: true })
      .abortSignal(timeout.signal);

    if (error) return [];
    return data as (Tag & { post_count: number })[];
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
}, ["all-tags"], { revalidate: 60 });
