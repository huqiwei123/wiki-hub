"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/actions/likes";

interface LikeButtonProps {
  targetType: "post" | "comment";
  targetId: string;
  initialCount: number;
  initialLiked: boolean;
  slug?: string;
}

export function LikeButton({ targetType, targetId, initialCount, initialLiked, slug }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleToggle = () => {
    startTransition(async () => {
      setLiked(!liked);
      setCount(liked ? count - 1 : count + 1);
      await toggleLike(targetType, targetId, slug);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        liked
          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      <Heart className={`size-3.5 ${liked ? "fill-current" : ""}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
