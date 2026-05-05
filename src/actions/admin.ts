"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// --- Categories ---

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  await supabase.from("categories").insert({
    name,
    slug: generateSlug(name),
    description,
  });

  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  await supabase.from("categories")
    .update({ name, slug: generateSlug(name), description })
    .eq("id", id);

  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

// --- Tags ---

export async function createTag(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const color = (formData.get("color") as string) || null;

  await supabase.from("tags").insert({
    name,
    slug: generateSlug(name),
    description,
    color,
  });

  revalidatePath("/admin/tags");
}

export async function updateTag(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const color = (formData.get("color") as string) || null;

  await supabase.from("tags")
    .update({ name, slug: generateSlug(name), description, color })
    .eq("id", id);

  revalidatePath("/admin/tags");
}

export async function deleteTag(id: string) {
  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", id);
  revalidatePath("/admin/tags");
}
