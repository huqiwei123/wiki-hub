import { getAllPosts } from "@/queries/posts";
import { getAllCategories } from "@/queries/categories";
import { getAllTags } from "@/queries/tags";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { deletePost, togglePublish } from "@/actions/posts";

export default async function AdminDashboard() {
  const { posts, total: postCount } = await getAllPosts(1, 50);
  const categories = await getAllCategories();
  const tags = await getAllTags();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          New Post
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Posts</p>
          <p className="text-3xl font-bold">{postCount}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-3xl font-bold">{categories.length}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Tags</p>
          <p className="text-3xl font-bold">{tags.length}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Posts</h2>
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/posts/${post.id}/edit`} className="font-medium hover:underline">
                    {post.title}
                  </Link>
                  <Badge variant={post.published ? "default" : "secondary"}>
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {post.categories?.name} &middot; {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={togglePublish.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
                  >
                    {post.published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={deletePost.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="rounded-md border border-destructive px-3 py-1 text-sm text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
