"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createComment(formData: FormData) {
  const supabase = await createClient();

  const postId = formData.get("post_id") as string;
  const content = formData.get("content") as string;
  const parentId = formData.get("parent_id") as string | null;
  const guestName = formData.get("guest_name") as string | null;
  const guestEmail = formData.get("guest_email") as string | null;
  const slug = formData.get("slug") as string;

  if (!content?.trim() || !postId) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: content.trim(),
    parent_id: parentId || null,
    author_id: user?.id ?? null,
    guest_name: user ? null : (guestName?.trim() || "Anonymous"),
    guest_email: user ? null : (guestEmail?.trim() || null),
  });

  if (!error && slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function deleteComment(commentId: string, slug?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("author_id", user.id);

  if (!error && slug) {
    revalidatePath(`/blog/${slug}`);
  }
}
