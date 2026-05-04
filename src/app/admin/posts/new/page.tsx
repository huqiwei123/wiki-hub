import { createPost } from "@/actions/posts";
import { getAllCategories } from "@/queries/categories";
import { getAllTags } from "@/queries/tags";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function NewPostPage() {
  const categories = await getAllCategories();
  const tags = await getAllTags();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">New Post</h1>
      <form action={createPost} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" type="text" required placeholder="Post title" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" name="excerpt" rows={2} placeholder="Brief description" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea id="content" name="content" rows={20} required placeholder="Write your post in Markdown..." className="font-mono text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <select id="category_id" name="category_id" className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image URL</Label>
            <Input id="cover_image" name="cover_image" type="url" placeholder="https://..." />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted">
                <input type="checkbox" name="tag_ids" value={tag.id} className="rounded" />
                {tag.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" className="rounded" />
            Publish immediately
          </label>
          <div className="flex-1" />
          <Button type="submit">Create Post</Button>
        </div>
      </form>
    </div>
  );
}
