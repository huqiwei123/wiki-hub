import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/50 p-6">
        <h2 className="mb-6 text-lg font-semibold">Admin</h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block rounded-md px-3 py-2 hover:bg-muted">
            Dashboard
          </Link>
          <Link href="/admin/posts/new" className="block rounded-md px-3 py-2 hover:bg-muted">
            New Post
          </Link>
          <Link href="/admin/categories" className="block rounded-md px-3 py-2 hover:bg-muted">
            Categories
          </Link>
          <Link href="/admin/tags" className="block rounded-md px-3 py-2 hover:bg-muted">
            Tags
          </Link>
        </nav>
        <div className="mt-8 border-t pt-4">
          <Link href="/" className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            View Site
          </Link>
          <form action={logout}>
            <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted">
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
