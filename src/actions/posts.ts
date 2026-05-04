"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import readingTime from "reading-time";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const slug = generateSlug(title);
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const categoryId = (formData.get("category_id") as string) || null;
  const published = formData.get("published") === "on";
  const coverImage = (formData.get("cover_image") as string) || null;
  const tagIds = formData.getAll("tag_ids") as string[];

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title,
      content,
      excerpt: excerpt || null,
      category_id: categoryId,
      author_id: user.id,
      cover_image: coverImage,
      reading_time: readingTime(content).minutes,
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (tagIds.length > 0) {
    await supabase.from("post_tags").insert(
      tagIds.map((tagId) => ({
        post_id: post.id,
        tag_id: tagId,
      })),
    );
  }

  revalidatePath("/blog");
  revalidatePath("/");
  redirect(`/admin/posts/${post.id}/edit`);
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const categoryId = (formData.get("category_id") as string) || null;
  const published = formData.get("published") === "on";
  const coverImage = (formData.get("cover_image") as string) || null;
  const tagIds = formData.getAll("tag_ids") as string[];

  const { data: existing } = await supabase
    .from("posts")
    .select("published")
    .eq("id", postId)
    .single();

  const { error } = await supabase
    .from("posts")
    .update({
      title,
      content,
      excerpt: excerpt || null,
      category_id: categoryId,
      cover_image: coverImage,
      reading_time: readingTime(content).minutes,
      published,
      published_at: published && !existing?.published ? new Date().toISOString() : undefined,
    })
    .eq("id", postId);

  if (error) throw new Error(error.message);

  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (tagIds.length > 0) {
    await supabase.from("post_tags").insert(
      tagIds.map((tagId) => ({
        post_id: postId,
        tag_id: tagId,
      })),
    );
  }

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath(`/blog/${generateSlug(title)}`);
}

export async function deletePost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw new Error(error.message);

  revalidatePath("/blog");
  revalidatePath("/");
}

export async function togglePublish(postId: string) {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("published")
    .eq("id", postId)
    .single();

  if (!post) throw new Error("Post not found");

  const newPublished = !post.published;

  await supabase
    .from("posts")
    .update({
      published: newPublished,
      published_at: newPublished ? new Date().toISOString() : null,
    })
    .eq("id", postId);

  revalidatePath("/blog");
  revalidatePath("/");
}
