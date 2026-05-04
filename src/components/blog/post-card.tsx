import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarDays, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/types";

type PostCardProps = {
  post: Pick<Post, "id" | "slug" | "title" | "excerpt" | "published_at" | "reading_time" | "categories"> &
    Partial<Pick<Post, "cover_image" | "view_count">> & { tags?: Post["tags"] };
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group reveal-up">
      <Link
        href={`/blog/${post.slug}`}
        className="glass-panel grid overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(17,24,39,0.18)] sm:grid-cols-[minmax(220px,0.42fr)_1fr]"
      >
        <div className="relative min-h-56 overflow-hidden bg-muted sm:min-h-full">
          {post.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_24%,oklch(0.74_0.14_195/.55),transparent_30%),radial-gradient(circle_at_74%_68%,oklch(0.76_0.16_76/.5),transparent_32%),linear-gradient(135deg,oklch(0.28_0.06_252),oklch(0.2_0.04_220))]">
              <div className="absolute inset-6 rounded-2xl border border-white/15" />
              <div className="absolute left-8 top-9 h-2 w-2 rounded-full bg-white/80 shadow-[48px_38px_0_rgba(255,255,255,.45),120px_22px_0_rgba(255,255,255,.5),86px_112px_0_rgba(255,255,255,.38)]" />
              <div className="absolute bottom-8 left-8 right-8 h-px rotate-[-14deg] bg-white/25" />
              <div className="absolute bottom-20 left-10 right-10 h-px rotate-[18deg] bg-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-medium text-white/85">
            <BookOpen className="size-3.5" />
            <span>Article</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {post.categories && (
              <Badge variant="secondary" className="h-7 rounded-lg border border-white/40 bg-background/50 px-2.5 text-xs dark:border-white/10">
                {post.categories.name}
              </Badge>
            )}
            {post.published_at && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString()}
                </time>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5" />
              {post.reading_time} min read
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-balance text-2xl font-semibold tracking-tight transition-colors group-hover:text-primary">
              {post.title}
            </h2>
            <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl border border-white/45 bg-background/40 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:bg-primary group-hover:text-primary-foreground dark:border-white/10">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
          {post.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="rounded-lg bg-background/35 text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
