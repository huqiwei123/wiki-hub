import { Suspense } from "react";
import { getPostBySlug } from "@/queries/posts";
import { MdxContent } from "@/components/mdx/mdx-content";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, Clock3, Eye, UserRound } from "lucide-react";
import { Backlinks } from "@/components/knowledge/backlinks";
import { getBacklinks, getForwardLinks } from "@/queries/graph";
import { getComments, getCommentCount } from "@/queries/comments";
import { getLikeCount, hasUserLiked } from "@/queries/likes";
import { LikeButton } from "@/components/social/like-button";
import { ShareButtons } from "@/components/social/share-buttons";
import { CommentSection } from "@/components/social/comment-section";
import { siteConfig } from "@/config/site";
import { currentUser } from "@/lib/auth/current-user";

async function checkUserLiked(postId: string): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  return hasUserLiked(user.id, "post", postId);
}

async function BacklinksAsync({ postId }: { postId: string }) {
  const [backlinks, forwardLinks] = await Promise.all([
    getBacklinks(postId),
    getForwardLinks(postId),
  ]);
  return <Backlinks forwardLinks={forwardLinks} backlinks={backlinks} />;
}

async function CommentsAsync({ postId, slug }: { postId: string; slug: string }) {
  const [comments, count] = await Promise.all([
    getComments(postId),
    getCommentCount(postId),
  ]);
  return <CommentSection postId={postId} slug={slug} initialComments={comments} initialCount={count} />;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.title,
      description: post.excerpt ?? undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt ?? undefined,
        type: "article",
        publishedTime: post.published_at ?? undefined,
      },
    };
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

  const [likeCount, userLiked] = await Promise.all([
    getLikeCount("post", post.id),
    checkUserLiked(post.id),
  ]);

  const postUrl = `${siteConfig.url}/blog/${slug}`;

  return (
    <article className="mx-auto max-w-5xl space-y-8 pt-8 pb-16 sm:pt-10">
      <nav aria-label="Breadcrumb" className="reveal-up">
        <Link
          href="/blog"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-md"
        >
          <ArrowLeft className="size-4" />
          Back to Articles
        </Link>
      </nav>

      <header className="glass-panel reveal-up overflow-hidden rounded-3xl">
        <div className={`relative min-h-72 p-6 sm:p-8 lg:p-10 ${post.cover_image ? "text-white" : ""}`}>
          {post.cover_image ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${post.cover_image})` }}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.72_0.13_205/.28),transparent_30%),radial-gradient(circle_at_82%_48%,oklch(0.76_0.15_74/.22),transparent_34%)]" />
          )}
          <div className="relative">
            <div className="flex flex-wrap gap-2">
              {post.categories && (
                <Badge variant="secondary" className={post.cover_image ? "h-7 rounded-lg !border-white/30 !bg-white/15 !text-white px-2.5" : "h-7 rounded-lg px-2.5"}>{post.categories.name}</Badge>
              )}
              {post.tags?.map((tag) => (
                <Badge key={tag.id} variant="outline" className={post.cover_image ? "h-7 rounded-lg !border-white/30 !bg-white/10 !text-white px-2.5" : "h-7 rounded-lg bg-background/35 px-2.5"}>{tag.name}</Badge>
              ))}
            </div>
            <h1 className={`mt-8 max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl ${post.cover_image ? "[text-shadow:0_2px_12px_rgba(0,0,0,.6)]" : ""}`}>{post.title}</h1>
            {post.excerpt && (
              <p className={`mt-5 max-w-2xl text-base leading-8 ${post.cover_image ? "text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,.5)]" : "text-muted-foreground"}`}>{post.excerpt}</p>
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
          <div className="ml-auto flex items-center gap-3">
            <LikeButton targetType="post" targetId={post.id} initialCount={likeCount} initialLiked={userLiked} slug={slug} />
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </div>
      </header>

      <div className="glass-panel rounded-3xl px-5 py-8 sm:px-8 lg:px-10">
        <MdxContent source={post.content} />
      </div>

      <Suspense fallback={
        <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-4 flex gap-2">
            <div className="h-7 w-24 rounded-md bg-muted" />
            <div className="h-7 w-32 rounded-md bg-muted" />
          </div>
        </div>
      }>
        <BacklinksAsync postId={post.id} />
      </Suspense>

      <Suspense fallback={
        <div className="glass-panel rounded-3xl p-6 sm:p-8 lg:p-10 animate-pulse">
          <div className="h-5 w-28 rounded bg-muted" />
          <div className="mt-6 space-y-4">
            <div className="h-20 rounded-xl bg-muted" />
            <div className="h-20 rounded-xl bg-muted" />
          </div>
        </div>
      }>
        <CommentsAsync postId={post.id} slug={slug} />
      </Suspense>
    </article>
  );
}
