"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { getAllCategories } from "@/queries/categories";
import { createCategory, updateCategory, deleteCategory } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
}

type CategoryQueryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  post_count?: number;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    const data = await getAllCategories();
    setCategories((data as CategoryQueryItem[]).map((c) => ({
      id: c.id, name: c.name, slug: c.slug,
      description: c.description ?? null, post_count: c.post_count ?? 0,
    })));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description ?? "");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    const fd = new FormData();
    fd.set("name", editName);
    fd.set("description", editDesc);
    await updateCategory(id, fd);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    load();
  };

  const handleCreate = async () => {
    const fd = new FormData();
    fd.set("name", newName);
    fd.set("description", newDesc);
    await createCategory(fd);
    setNewName("");
    setNewDesc("");
    setShowNew(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your content categories</p>
        </div>
        <Button onClick={() => setShowNew(true)} size="sm" variant="outline">
          <Plus className="mr-1.5 size-4" />
          Add Category
        </Button>
      </div>

      {showNew && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <Input
            placeholder="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
            <Check className="mr-1 size-3.5" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>
            <X className="size-4" />
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-card">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between border-b p-4 last:border-b-0">
            {editingId === cat.id ? (
              <div className="flex flex-1 items-center gap-3">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-48"
                />
                <Input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description"
                  className="flex-1"
                />
                <Button size="sm" onClick={() => saveEdit(cat.id)}>
                  <Check className="mr-1 size-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">/{cat.slug}</p>
                  {cat.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{cat.post_count} posts</span>
                  <button
                    onClick={() => startEdit(cat)}
                    className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No categories yet.</div>
        )}
      </div>
    </div>
  );
}
