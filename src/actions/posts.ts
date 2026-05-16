"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import readingTime from "reading-time";
import { requireAdmin } from "@/lib/auth/current-user";
import { queryOne, transaction } from "@/lib/db/query";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createPost(formData: FormData) {
  const user = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slug = generateSlug(title);
  const content = String(formData.get("content") ?? "");
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const published = formData.get("published") === "on";
  const coverImage = String(formData.get("cover_image") ?? "") || null;
  const tagIds = formData.getAll("tag_ids").map(String).filter(Boolean);

  if (!title || !slug) throw new Error("Title is required");

  const post = await transaction(async (client) => {
    const inserted = await client.query<{ id: string }>(
      `
      INSERT INTO posts (
        slug, title, content, excerpt, category_id, author_id,
        cover_image, reading_time, published, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
      `,
      [
        slug,
        title,
        content,
        excerpt || null,
        categoryId,
        user.id,
        coverImage,
        Math.round(readingTime(content).minutes),
        published,
        published ? new Date().toISOString() : null,
      ],
    );

    const postId = inserted.rows[0].id;
    for (const tagId of tagIds) {
      await client.query(
        "INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [postId, tagId],
      );
    }
    return { id: postId };
  });

  revalidatePath("/blog");
  revalidatePath("/");
  redirect(`/admin/posts/${post.id}/edit`);
}

export async function updatePost(postId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const published = formData.get("published") === "on";
  const coverImage = String(formData.get("cover_image") ?? "") || null;
  const tagIds = formData.getAll("tag_ids").map(String).filter(Boolean);

  await transaction(async (client) => {
    const existing = await client.query<{ published: boolean; slug: string }>(
      "SELECT published, slug FROM posts WHERE id = $1",
      [postId],
    );

    if (!existing.rows[0]) throw new Error("Post not found");

    await client.query(
      `
      UPDATE posts
      SET title = $1,
          content = $2,
          excerpt = $3,
          category_id = $4,
          cover_image = $5,
          reading_time = $6,
          published = $7,
          published_at = CASE
            WHEN $7 = true AND published = false THEN now()
            WHEN $7 = false THEN NULL
            ELSE published_at
          END
      WHERE id = $8
      `,
      [
        title,
        content,
        excerpt || null,
        categoryId,
        coverImage,
        Math.round(readingTime(content).minutes),
        published,
        postId,
      ],
    );

    await client.query("DELETE FROM post_tags WHERE post_id = $1", [postId]);
    for (const tagId of tagIds) {
      await client.query(
        "INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [postId, tagId],
      );
    }
  });

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath(`/blog/${generateSlug(title)}`);
  redirect(`/admin/posts/${postId}/edit?saved=1`);
}

export async function deletePost(postId: string) {
  await requireAdmin();

  await queryOne("DELETE FROM posts WHERE id = $1", [postId]);

  revalidatePath("/blog");
  revalidatePath("/");
}

export async function togglePublish(postId: string) {
  await requireAdmin();

  const post = await queryOne<{ published: boolean }>(
    "SELECT published FROM posts WHERE id = $1",
    [postId],
  );

  if (!post) throw new Error("Post not found");

  const newPublished = !post.published;
  await queryOne(
    `
    UPDATE posts
    SET published = $1,
        published_at = CASE WHEN $1 = true THEN now() ELSE NULL END
    WHERE id = $2
    `,
    [newPublished, postId],
  );

  revalidatePath("/blog");
  revalidatePath("/");
}
