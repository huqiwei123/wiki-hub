"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { queryOne } from "@/lib/db/query";

export async function toggleLike(targetType: "post" | "comment", targetId: string, slug?: string) {
  const user = await requireUser();

  const deleted = await queryOne<{ id: string }>(
    "DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3 RETURNING id",
    [user.id, targetType, targetId],
  );

  if (!deleted) {
    await queryOne(
      `
      INSERT INTO likes (user_id, target_type, target_id)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
      `,
      [user.id, targetType, targetId],
    );
  }

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}
