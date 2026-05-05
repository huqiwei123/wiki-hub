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
    <article className="group reveal-up h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(17,24,39,0.18)]"
      >
        <div className="relative shrink-0 overflow-hidden bg-muted" style={{ aspectRatio: "2/1" }}>
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
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-medium text-white/85">
            <BookOpen className="size-3" />
            <span>Article</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {post.categories && (
              <Badge variant="secondary" className="h-6 rounded-md border border-white/40 bg-background/50 px-2 text-xs dark:border-white/10">
                {post.categories.name}
              </Badge>
            )}
            {post.published_at && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" />
                {new Date(post.published_at).toLocaleDateString()}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3" />
              {post.reading_time}m
            </span>
          </div>
          <h2 className="mt-3 text-balance text-base font-semibold tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
              {post.tags.map((tag, i) => (
                <Badge key={tag.id ?? i} variant="outline" className="rounded-md bg-background/35 text-xs">
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
