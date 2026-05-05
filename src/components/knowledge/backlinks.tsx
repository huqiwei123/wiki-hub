"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeftRight } from "lucide-react";

interface Backlink {
  slug: string;
  title: string;
}

interface BacklinksProps {
  slug?: string;
  forwardLinks: Backlink[];
  backlinks: Backlink[];
}

export function Backlinks({ forwardLinks, backlinks }: BacklinksProps) {
  if (backlinks.length === 0 && forwardLinks.length === 0) return null;

  return (
    <div className="mt-10 rounded-xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <ArrowLeftRight className="size-4 text-muted-foreground" />
        Linked References
      </h2>

      {forwardLinks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-medium text-muted-foreground">Links to</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {forwardLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/blog/${link.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20"
              >
                {link.title}
                <ArrowRight className="size-3" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {backlinks.length > 0 && (
        <div className={forwardLinks.length > 0 ? "mt-4" : "mt-4"}>
          <h3 className="text-xs font-medium text-muted-foreground">Linked from</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {backlinks.map((link) => (
              <Link
                key={link.slug}
                href={`/blog/${link.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80"
              >
                <ArrowRight className="size-3 rotate-180" />
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
