import { publicSupabase, withTimeoutSignal } from "@/lib/supabase/public";
import type { Category } from "@/types";
import { cache } from "react";

export const getAllCategories = cache(async () => {
  const timeout = withTimeoutSignal();
  try {
    const { data, error } = await publicSupabase
      .from("categories")
      .select("*, post_count:posts(count)")
      .order("sort_order", { ascending: true })
      .abortSignal(timeout.signal);

    if (error || !data) return [];

    return (data as Array<Category & { post_count: Array<{ count: number }> }>).map((cat) => ({
      ...cat,
      post_count: cat.post_count?.[0]?.count ?? 0,
    }));
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
});
