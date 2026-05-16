"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { queryOne } from "@/lib/db/query";

export async function toggleBookmark(postId: string) {
  const user = await requireUser();

  const deleted = await queryOne<{ id: string }>(
    "DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2 RETURNING id",
    [user.id, postId],
  );

  if (!deleted) {
    await queryOne(
      "INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [user.id, postId],
    );
  }

  revalidatePath("/bookmarks");
}
