"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface BlogPaginationProps {
  current: number;
  total: number;
}

export function BlogPagination({ current, total }: BlogPaginationProps) {
  const searchParams = useSearchParams();
  const currentParams = new URLSearchParams(searchParams.toString());

  const buildHref = (page: number) => {
    const params = new URLSearchParams(currentParams);
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex justify-center gap-2">
      {current > 1 ? (
        <Link href={buildHref(current - 1)} className="grid size-9 cursor-pointer place-items-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">‹</Link>
      ) : (
        <span className="grid size-9 place-items-center rounded-lg text-xs text-muted-foreground/40">‹</span>
      )}
      {Array.from({ length: total }, (_, i) => i + 1).map((p) =>
        p === current ? (
          <span key={p} className="grid size-9 place-items-center rounded-lg bg-primary text-xs font-medium text-primary-foreground">{p}</span>
        ) : (
          <Link key={p} href={buildHref(p)} className="grid size-9 cursor-pointer place-items-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">{p}</Link>
        )
      )}
      {current < total ? (
        <Link href={buildHref(current + 1)} className="grid size-9 cursor-pointer place-items-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">›</Link>
      ) : (
        <span className="grid size-9 place-items-center rounded-lg text-xs text-muted-foreground/40">›</span>
      )}
    </div>
  );
}
