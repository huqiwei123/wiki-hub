import { publicSupabase, withTimeoutSignal } from "@/lib/supabase/public";
import { cache } from "react";

export const getLikeCount = cache(async (targetType: "post" | "comment", targetId: string) => {
  const timeout = withTimeoutSignal();
  try {
    const { count, error } = await publicSupabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .abortSignal(timeout.signal);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  } finally {
    timeout.clear();
  }
});

export const getLikesByTarget = cache(async (targetType: "post" | "comment", targetId: string) => {
  const timeout = withTimeoutSignal();
  try {
    const { data } = await publicSupabase
      .from("likes")
      .select("id, user_id, target_type, target_id, created_at")
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .abortSignal(timeout.signal);

    return data ?? [];
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
});
