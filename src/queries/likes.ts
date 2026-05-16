import { cache } from "react";
import { query, queryOne } from "@/lib/db/query";
import type { Like } from "@/types";

export const getLikeCount = cache(async (targetType: "post" | "comment", targetId: string) => {
  const row = await queryOne<{ count: string }>(
    "SELECT count(*) FROM likes WHERE target_type = $1 AND target_id = $2",
    [targetType, targetId],
  );

  return Number(row?.count ?? 0);
});

export const getLikesByTarget = cache(async (targetType: "post" | "comment", targetId: string) => {
  return query<Like>(
    `
    SELECT id, user_id, target_type, target_id, created_at
    FROM likes
    WHERE target_type = $1 AND target_id = $2
    ORDER BY created_at DESC
    `,
    [targetType, targetId],
  );
});

export async function hasUserLiked(userId: string, targetType: "post" | "comment", targetId: string) {
  const row = await queryOne<{ id: string }>(
    "SELECT id FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3",
    [userId, targetType, targetId],
  );

  return Boolean(row);
}
