import { getPostBySlug } from "@/queries/posts";
import { MdxContent } from "@/components/mdx/mdx-content";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Clock3, Eye, UserRound } from "lucide-react";
import { Backlinks } from "@/components/knowledge/backlinks";
import { getBacklinks, getForwardLinks } from "@/queries/graph";
import { getComments, getCommentCount } from "@/queries/comments";
import { getLikeCount } from "@/queries/likes";
import dynamic from "next/dynamic";
import { LikeButton } from "@/components/social/like-button";

const CommentSection = dynamic(
  () => import("@/components/social/comment-section").then((mod) => ({ default: mod.CommentSection })),
  { loading: () => <div className="glass-panel rounded-3xl px-5 py-8 text-center text-sm text-muted-foreground">Loading comments...</div> }
);
import { ShareButtons } from "@/components/social/share-buttons";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

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

  const [backlinks, forwardLinks, comments, commentCount, likeCount] = await Promise.all([
    getBacklinks(slug),
    getForwardLinks(slug),
    getComments(post.id),
    getCommentCount(post.id),
    getLikeCount("post", post.id),
  ]);

  let userLiked = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("target_type", "post")
        .eq("target_id", post.id)
        .maybeSingle();
      userLiked = !!data;
    }
  } catch {
    // User not authenticated — leave userLiked as false
  }

  const postUrl = `${siteConfig.url}/blog/${slug}`;

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
          <div className="ml-auto flex items-center gap-3">
            <LikeButton targetType="post" targetId={post.id} initialCount={likeCount} initialLiked={userLiked} slug={slug} />
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </div>
      </header>

      <div className="glass-panel rounded-3xl px-5 py-8 sm:px-8 lg:px-10">
        <MdxContent source={post.content} />
      </div>

      <Backlinks slug={slug} forwardLinks={forwardLinks} backlinks={backlinks} />

      <CommentSection postId={post.id} slug={slug} initialComments={comments} initialCount={commentCount} />
    </article>
  );
}
