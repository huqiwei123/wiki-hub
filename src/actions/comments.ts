"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/current-user";
import { queryOne } from "@/lib/db/query";
import { getCommentReplies } from "@/queries/comments";

export async function createComment(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const parentId = String(formData.get("parent_id") ?? "") || null;
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const guestEmail = String(formData.get("guest_email") ?? "").trim() || null;
  const slug = String(formData.get("slug") ?? "");

  if (!content || !postId) return;

  const user = await currentUser();

  await queryOne(
    `
    INSERT INTO comments (post_id, content, parent_id, author_id, guest_name, guest_email)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      postId,
      content,
      parentId,
      user?.id ?? null,
      user ? null : guestName || "Anonymous",
      user ? null : guestEmail,
    ],
  );

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function deleteComment(commentId: string, slug?: string) {
  const user = await currentUser();
  if (!user) redirect("/login");

  await queryOne(
    "DELETE FROM comments WHERE id = $1 AND author_id = $2",
    [commentId, user.id],
  );

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function getCommentRepliesAction(parentId: string) {
  return getCommentReplies(parentId);
}
