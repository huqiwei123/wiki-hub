"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { getAllTags } from "@/queries/tags";
import { createTag, updateTag, deleteTag } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  post_count: number;
}

const PRESET_COLORS = [
  "#2563eb", "#059669", "#dc2626", "#d97706",
  "#7c3aed", "#db2777", "#0891b2", "#65a30d",
  "#9333ea", "#e11d48", "#0284c7", "#4f46e5",
];

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    const data = await getAllTags();
    setTags(data.map((t: any) => ({
      id: t.id, name: t.name, slug: t.slug,
      color: t.color ?? null, description: t.description ?? null,
      post_count: t.post_count ?? 0,
    })));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (tag: TagItem) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color ?? PRESET_COLORS[0]);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    const fd = new FormData();
    fd.set("name", editName);
    fd.set("color", editColor);
    await updateTag(id, fd);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteTag(id);
    load();
  };

  const handleCreate = async () => {
    const fd = new FormData();
    fd.set("name", newName);
    fd.set("color", newColor);
    await createTag(fd);
    setNewName("");
    setShowNew(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your content tags</p>
        </div>
        <Button onClick={() => setShowNew(true)} size="sm" variant="outline">
          <Plus className="mr-1.5 size-4" />
          Add Tag
        </Button>
      </div>

      {showNew && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <Input
            placeholder="Tag name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-48"
          />
          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={`size-6 rounded-full border-2 transition-all ${newColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
            <Check className="mr-1 size-3.5" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>
            <X className="size-4" />
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-card">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center justify-between border-b p-4 last:border-b-0">
            {editingId === tag.id ? (
              <div className="flex flex-1 items-center gap-3">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-48"
                />
                <div className="flex items-center gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      className={`size-6 rounded-full border-2 transition-all ${editColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <Button size="sm" onClick={() => saveEdit(tag.id)}>
                  <Check className="mr-1 size-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color ?? "#64748b" }}
                  />
                  <div>
                    <p className="font-medium">{tag.name}</p>
                    <p className="text-sm text-muted-foreground">/{tag.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{tag.post_count} posts</span>
                  <button
                    onClick={() => startEdit(tag)}
                    className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {tags.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No tags yet.</div>
        )}
      </div>
    </div>
  );
}
