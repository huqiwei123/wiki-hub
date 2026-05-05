"use client";

import { useState, useRef, useTransition } from "react";
import { MessageCircle, UserRound, ChevronDown, ChevronUp } from "lucide-react";
import { createComment, deleteComment } from "@/actions/comments";
import { getCommentReplies } from "@/queries/comments";
import { LikeButton } from "./like-button";
import { Separator } from "@/components/ui/separator";
import type { Comment } from "@/types";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CommentItem({ comment, postId, slug, depth = 0 }: { comment: Comment; postId: string; slug: string; depth?: number }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const replyFormRef = useRef<HTMLFormElement>(null);

  const loadReplies = async () => {
    if (!showReplies && replies.length === 0) {
      setLoadingReplies(true);
      const data = await getCommentReplies(comment.id);
      setReplies(data);
      setLoadingReplies(false);
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-border pl-4" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
          {comment.profiles?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.profiles.avatar_url} alt="" className="size-8 rounded-full object-cover" />
          ) : (
            <UserRound className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.profiles?.display_name ?? comment.guest_name ?? "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{comment.content}</p>
          <div className="mt-2 flex items-center gap-2">
            <LikeButton targetType="comment" targetId={comment.id} initialCount={0} initialLiked={false} slug={slug} />
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              Reply
            </button>
          </div>

          {showReplyForm && (
            <form
              ref={replyFormRef}
              action={async (formData) => {
                await createComment(formData);
                replyFormRef.current?.reset();
                setShowReplyForm(false);
                setShowReplies(true);
                const data = await getCommentReplies(comment.id);
                setReplies(data);
              }}
              className="mt-3"
            >
              <input type="hidden" name="post_id" value={postId} />
              <input type="hidden" name="parent_id" value={comment.id} />
              <input type="hidden" name="slug" value={slug} />
              <textarea
                name="content"
                rows={2}
                placeholder="Write a reply..."
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:bg-background"
                required
              />
              <button
                type="submit"
                className="mt-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
              >
                Reply
              </button>
            </form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <button onClick={loadReplies} className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              {showReplies ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
            </button>
          )}

          {loadingReplies && <p className="mt-2 text-xs text-muted-foreground">Loading replies...</p>}

          {showReplies &&
            replies.map((reply) => (
              <div key={reply.id} className="mt-3">
                <CommentItem comment={reply} postId={postId} slug={slug} depth={Math.min(depth + 1, 2)} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

interface CommentSectionProps {
  postId: string;
  slug: string;
  initialComments: Comment[];
  initialCount: number;
}

export function CommentSection({ postId, slug, initialComments, initialCount }: CommentSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [comments, setComments] = useState(initialComments);
  const [count, setCount] = useState(initialCount);

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8 lg:p-10">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Comments {count > 0 && <span className="text-muted-foreground">({count})</span>}
        </h2>
      </div>

      <Separator className="my-6" />

      <form
        ref={formRef}
        action={async (formData) => {
          await createComment(formData);
          formRef.current?.reset();
          setCount((c) => c + 1);
        }}
      >
        <input type="hidden" name="post_id" value={postId} />
        <input type="hidden" name="slug" value={slug} />
        <textarea
          name="content"
          rows={3}
          placeholder="Share your thoughts..."
          className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary/50 focus:bg-background"
          required
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Comments are public. Be respectful.</p>
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Post comment
          </button>
        </div>
      </form>

      {comments.length > 0 && (
        <>
          <Separator className="my-8" />
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} postId={postId} slug={slug} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
