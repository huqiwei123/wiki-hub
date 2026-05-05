"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowUpRight, Hash, Tag } from "lucide-react";
import type React from "react";
import { PageHero, Pagination, SearchBox, SortBar } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { getAllTags } from "@/queries/tags";

interface TagItem {
  name: string;
  slug: string;
  color: string | null;
  post_count: number;
}

const SORT_OPTIONS = ["Most Popular", "A-Z", "Z-A"];

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState("Most Popular");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAllTags().then((data) => {
      setTags(data.map((t) => ({
        name: t.name,
        slug: t.slug,
        color: t.color,
        post_count: (t as any).post_count ?? 0,
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const result = [...tags];
    if (activeSort === "A-Z") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (activeSort === "Z-A") result.sort((a, b) => b.name.localeCompare(a.name));
    else result.sort((a, b) => b.post_count - a.post_count);
    return result;
  }, [tags, activeSort]);

  const filtered = search
    ? sorted.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : sorted;

  const perPage = 12;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalArticles = tags.reduce((sum, t) => sum + t.post_count, 0);
  const popularTag = tags.length > 0 ? tags.reduce((a, b) => a.post_count > b.post_count ? a : b).name : "-";

  if (loading) {
    return (
      <div className="w-full pb-16">
        <PageHero title="Tags" subtitle="Explore content by specific topics and keywords" />
        <Container>
          <div className="mt-12 text-center text-sm text-muted-foreground">Loading tags...</div>
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      <PageHero title="Tags" subtitle="Explore content by specific topics and keywords" />
      <Container>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          <StatCard icon={<Tag className="size-4 text-chart-1" />} label="Total Tags" value={String(tags.length)} />
          <StatCard icon={<Hash className="size-4 text-chart-2" />} label="Tagged Articles" value={String(totalArticles)} />
          <StatCard icon={<ArrowUpRight className="size-4 text-chart-5" />} label="Popular Tag" value={popularTag} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <SortBar options={SORT_OPTIONS} activeOption={activeSort} onSort={setActiveSort} />
          <div className="ml-auto w-48">
            <SearchBox placeholder="Search tags..." value={search} onChange={setSearch} />
          </div>
        </div>

        <section className="mt-7">
          <h2 className="text-sm font-bold text-foreground">All Tags</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {paged.map((tag) => (
              <div key={tag.slug} className="flex h-16 items-center justify-between rounded-lg border border-border bg-card px-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="size-3 rounded-full" style={{ backgroundColor: tag.color ?? "#64748b" }} />
                  <span className="text-sm font-medium text-foreground">{tag.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{tag.post_count} articles</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 py-8 text-center text-sm text-muted-foreground">
                No tags found.
              </div>
            )}
          </div>
        </section>

        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </Container>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="h-[100px] rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-3 text-3xl font-extrabold text-foreground">{value}</div>
    </div>
  );
}
