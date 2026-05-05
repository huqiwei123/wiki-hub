"use client";

import { useState, useMemo } from "react";
import { ArrowUpRight, Hash, Tag } from "lucide-react";
import type React from "react";
import { PageHero, Pagination, SearchBox, SortBar } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { tags } from "@/lib/static-content";

const SORT_OPTIONS = ["Most Popular", "A-Z", "Z-A", "Newest"];

export default function TagsPage() {
  const [activeSort, setActiveSort] = useState("Most Popular");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    let result = [...tags];
    if (activeSort === "A-Z") result.sort((a, b) => a[0].localeCompare(b[0]));
    else if (activeSort === "Z-A") result.sort((a, b) => b[0].localeCompare(a[0]));
    else result.sort((a, b) => b[1] - a[1]); // Most Popular / Newest by count
    return result;
  }, [activeSort]);

  const filtered = search
    ? sorted.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    : sorted;

  const perPage = 12;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="w-full pb-16">
      <PageHero title="Tags" subtitle="Explore content by specific topics and keywords" />
      <Container>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          <StatCard icon={<Tag className="size-4 text-chart-1" />} label="Total Tags" value="142" />
          <StatCard icon={<Hash className="size-4 text-chart-2" />} label="Tagged Articles" value="328" />
          <StatCard icon={<ArrowUpRight className="size-4 text-chart-5" />} label="Popular Tag" value="TypeScript" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <SortBar options={SORT_OPTIONS} activeOption={activeSort} onSort={setActiveSort} />
          <div className="ml-auto w-48">
            <SearchBox placeholder="Search tags..." value={search} onChange={setSearch} />
          </div>
        </div>

        <section className="mt-7">
          <h2 className="text-sm font-bold text-foreground">Popular Tags</h2>
          <div className="mt-4 rounded-xl border border-border bg-card p-7">
            <div className="flex flex-wrap gap-3">
              {filtered.slice(0, 16).map(([name, count, color, bg], index) => (
                <span
                  key={name}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 font-medium ${index < 12 ? "h-10 text-sm" : "h-9 text-xs"}`}
                  style={{ backgroundColor: bg, color }}
                >
                  {name}
                  <span className="grid min-w-5 place-items-center rounded-full px-1.5 text-[10px] text-white" style={{ backgroundColor: color }}>
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold text-foreground">All Tags</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {paged.map(([name, count, color]) => (
              <div key={name} className="flex h-16 items-center justify-between rounded-lg border border-border bg-card px-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium text-foreground">{name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{count} articles</span>
              </div>
            ))}
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
