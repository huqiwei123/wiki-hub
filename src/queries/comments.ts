import { publicSupabase, withTimeoutSignal } from "@/lib/supabase/public";
import { cache } from "react";
import type { Comment } from "@/types";

type CommentRow = Omit<Comment, "profiles" | "replies"> & {
  profiles: Comment["profiles"] | null;
};

export const getComments = cache(async (postId: string) => {
  const timeout = withTimeoutSignal();
  try {
    const { data, error } = await publicSupabase
      .from("comments")
      .select("*, profiles(id, display_name, avatar_url)")
      .eq("post_id", postId)
      .eq("is_approved", true)
      .is("parent_id", null)
      .order("created_at", { ascending: true })
      .abortSignal(timeout.signal);

    if (error || !data) return [];

    return (data as unknown as CommentRow[]).map((c) => ({
      ...c,
      profiles: c.profiles ?? null,
    })) as Comment[];
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
});

export const getCommentReplies = cache(async (parentId: string) => {
  const timeout = withTimeoutSignal();
  try {
    const { data, error } = await publicSupabase
      .from("comments")
      .select("*, profiles(id, display_name, avatar_url)")
      .eq("parent_id", parentId)
      .eq("is_approved", true)
      .order("created_at", { ascending: true })
      .abortSignal(timeout.signal);

    if (error || !data) return [];

    return (data as unknown as CommentRow[]).map((c) => ({
      ...c,
      profiles: c.profiles ?? null,
    })) as Comment[];
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
});

export const getCommentCount = cache(async (postId: string) => {
  const timeout = withTimeoutSignal();
  try {
    const { count, error } = await publicSupabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("is_approved", true)
      .abortSignal(timeout.signal);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  } finally {
    timeout.clear();
  }
});
