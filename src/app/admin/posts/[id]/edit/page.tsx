import { updatePost, deletePost } from "@/actions/posts";
import { getAllCategories } from "@/queries/categories";
import { getAllTags } from "@/queries/tags";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, tags:post_tags(tag_id)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const categories = await getAllCategories();
  const tags = await getAllTags();
  const selectedTagIds = post.tags?.map((t: { tag_id: string }) => t.tag_id) ?? [];

  const updatePostWithId = updatePost.bind(null, id);
  const deletePostWithId = deletePost.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <Badge variant={post.published ? "default" : "secondary"}>
            {post.published ? "Published" : "Draft"}
          </Badge>
        </div>
        <form action={deletePostWithId}>
          <button
            type="submit"
            className="rounded-md border border-destructive px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
          >
            Delete
          </button>
        </form>
      </div>

      <form action={updatePostWithId} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" type="text" required defaultValue={post.title} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={post.excerpt ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea
            id="content"
            name="content"
            rows={20}
            required
            defaultValue={post.content}
            className="font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <select id="category_id" name="category_id" defaultValue={post.category_id ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image URL</Label>
            <Input id="cover_image" name="cover_image" type="url" defaultValue={post.cover_image ?? ""} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted">
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={tag.id}
                  defaultChecked={selectedTagIds.includes(tag.id)}
                  className="rounded"
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={post.published} className="rounded" />
            Published
          </label>
          <div className="flex-1" />
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
