import { createClient } from "@/lib/supabase/server";
import { publicSupabase, withTimeoutSignal } from "@/lib/supabase/public";
import type { Category } from "@/types";
import { unstable_cache } from "next/cache";

export const getAllCategories = unstable_cache(async () => {
  const timeout = withTimeoutSignal();
  try {
    const { data, error } = await publicSupabase
      .from("categories")
      .select("*, post_count:posts(count)")
      .order("sort_order", { ascending: true })
      .abortSignal(timeout.signal);

    if (error) return [];
    return data as (Category & { post_count: number })[];
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
}, ["all-categories"], { revalidate: 60 });

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as Category;
}
