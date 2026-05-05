import { getPostBySlug } from "@/queries/posts";
import { MdxContent } from "@/components/mdx/mdx-content";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Clock3, Eye, UserRound } from "lucide-react";
import { Backlinks } from "@/components/knowledge/backlinks";
import { getBacklinks, getForwardLinks } from "@/queries/graph";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return { title: post.title, description: post.excerpt ?? undefined };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  const [backlinks, forwardLinks] = await Promise.all([
    getBacklinks(slug),
    getForwardLinks(slug),
  ]);

  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <header className="glass-panel reveal-up overflow-hidden rounded-3xl">
        <div className="relative min-h-72 p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.72_0.13_205/.28),transparent_30%),radial-gradient(circle_at_82%_48%,oklch(0.76_0.15_74/.22),transparent_34%)]" />
          <div className="relative">
            <div className="flex flex-wrap gap-2">
              {post.categories && (
                <Badge variant="secondary" className="h-7 rounded-lg px-2.5">{post.categories.name}</Badge>
              )}
              {post.tags?.map((tag) => (
                <Badge key={tag.id} variant="outline" className="h-7 rounded-lg bg-background/35 px-2.5">{tag.name}</Badge>
              ))}
            </div>
            <h1 className="mt-8 max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{post.title}</h1>
            {post.excerpt && (
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">{post.excerpt}</p>
            )}
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-4 border-t border-border/50 bg-background/30 px-6 py-4 text-sm text-muted-foreground backdrop-blur-xl sm:px-8 lg:px-10">
          {post.profiles?.display_name && (
            <span className="inline-flex items-center gap-2">
              <UserRound className="size-4" />
              {post.profiles.display_name}
            </span>
          )}
          {post.published_at && (
            <time dateTime={post.published_at} className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" />
              {new Date(post.published_at).toLocaleDateString()}
            </time>
          )}
          <span className="inline-flex items-center gap-2">
            <Clock3 className="size-4" />
            {post.reading_time} min read
          </span>
          <span className="inline-flex items-center gap-2">
            <Eye className="size-4" />
            {post.view_count.toLocaleString()} views
          </span>
        </div>
      </header>

      <div className="glass-panel rounded-3xl px-5 py-8 sm:px-8 lg:px-10">
        <MdxContent source={post.content} />
      </div>

      <Backlinks slug={slug} forwardLinks={forwardLinks} backlinks={backlinks} />
    </article>
  );
}
