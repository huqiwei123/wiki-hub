"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current-user";
import { queryOne } from "@/lib/db/query";
import { getAllCategories } from "@/queries/categories";
import { getAllTags } from "@/queries/tags";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) return;

  await queryOne(
    "INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)",
    [name, generateSlug(name), description],
  );

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
}

export async function getAdminCategories() {
  await requireAdmin();
  return getAllCategories();
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) return;

  await queryOne(
    "UPDATE categories SET name = $1, slug = $2, description = $3 WHERE id = $4",
    [name, generateSlug(name), description, id],
  );

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await queryOne("DELETE FROM categories WHERE id = $1", [id]);
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
}

export async function createTag(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "").trim() || null;
  if (!name) return;

  await queryOne(
    "INSERT INTO tags (name, slug, description, color) VALUES ($1, $2, $3, $4)",
    [name, generateSlug(name), description, color],
  );

  revalidatePath("/admin/tags");
  revalidatePath("/tags");
}

export async function getAdminTags() {
  await requireAdmin();
  return getAllTags();
}

export async function updateTag(id: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "").trim() || null;
  if (!name) return;

  await queryOne(
    "UPDATE tags SET name = $1, slug = $2, description = $3, color = $4 WHERE id = $5",
    [name, generateSlug(name), description, color, id],
  );

  revalidatePath("/admin/tags");
  revalidatePath("/tags");
}

export async function deleteTag(id: string) {
  await requireAdmin();
  await queryOne("DELETE FROM tags WHERE id = $1", [id]);
  revalidatePath("/admin/tags");
  revalidatePath("/tags");
}
