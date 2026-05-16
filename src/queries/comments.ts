import { cache } from "react";
import { query, queryOne } from "@/lib/db/query";
import type { Comment } from "@/types";

type CommentRow = Omit<Comment, "profiles" | "replies"> & {
  profile_id: string | null;
  profile_display_name: string | null;
  profile_avatar_url: string | null;
};

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    guest_name: row.guest_name,
    guest_email: row.guest_email,
    content: row.content,
    parent_id: row.parent_id,
    is_approved: row.is_approved,
    created_at: row.created_at,
    profiles: row.profile_id
      ? {
          id: row.profile_id,
          username: null,
          display_name: row.profile_display_name,
          avatar_url: row.profile_avatar_url,
          bio: null,
          role: "reader",
          created_at: row.created_at,
        }
      : null,
  };
}

async function getCommentsByParent(postId: string | null, parentId: string | null) {
  const rows = await query<CommentRow>(
    `
    SELECT c.*,
           p.id AS profile_id,
           p.display_name AS profile_display_name,
           p.avatar_url AS profile_avatar_url
    FROM comments c
    LEFT JOIN profiles p ON p.id = c.author_id
    WHERE c.is_approved = true
      AND (($1::uuid IS NULL) OR c.post_id = $1::uuid)
      AND (($2::uuid IS NULL AND c.parent_id IS NULL) OR c.parent_id = $2::uuid)
    ORDER BY c.created_at ASC
    `,
    [postId, parentId],
  );

  return rows.map(mapComment);
}

export const getComments = cache(async (postId: string) => {
  return getCommentsByParent(postId, null);
});

export const getCommentReplies = cache(async (parentId: string) => {
  return getCommentsByParent(null, parentId);
});

export const getCommentCount = cache(async (postId: string) => {
  const row = await queryOne<{ count: string }>(
    "SELECT count(*) FROM comments WHERE post_id = $1 AND is_approved = true",
    [postId],
  );

  return Number(row?.count ?? 0);
});
