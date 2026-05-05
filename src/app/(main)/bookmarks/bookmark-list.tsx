"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, BookOpenText, Calendar, Trash2 } from "lucide-react";
import { SearchBox } from "@/components/wikihub/ui";
import { toggleBookmark } from "@/actions/bookmarks";

interface BookmarkedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  reading_time: number;
  published_at: string | null;
  category: string | null;
}

interface BookmarkListProps {
  bookmarks: BookmarkedPost[];
}

export function BookmarkList({ bookmarks: initial }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState(initial);
  const [search, setSearch] = useState("");

  const filtered = search
    ? bookmarks.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
    : bookmarks;

  const removeBookmark = async (postId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== postId));
    await toggleBookmark(postId);
  };

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SearchBox placeholder="Filter bookmarks..." value={search} onChange={setSearch} />
        <span className="text-xs text-muted-foreground">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""} saved
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bm) => (
            <div
              key={bm.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                {bm.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bm.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <Bookmark className="absolute right-4 top-4 size-6 opacity-50" />
                )}
                <button
                  onClick={() => removeBookmark(bm.id)}
                  className="absolute right-3 top-3 z-10 grid size-7 cursor-pointer place-items-center rounded-md bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  aria-label="Remove bookmark"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="p-5">
                {bm.category && (
                  <span className="inline-flex h-6 items-center rounded-md bg-accent/15 px-2 text-[11px] font-medium text-accent">
                    {bm.category}
                  </span>
                )}
                <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-foreground">
                  <Link href={`/blog/${bm.slug}`} className="hover:text-primary">
                    {bm.title}
                  </Link>
                </h3>
                {bm.excerpt && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{bm.excerpt}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                  {bm.published_at && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(bm.published_at).toLocaleDateString()}
                    </span>
                  )}
                  <span>{bm.reading_time} min read</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <Bookmark className="size-12 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">No bookmarks yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Save articles to read later by clicking the bookmark icon.
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground"
            >
              <BookOpenText className="size-4" />
              Browse articles
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
