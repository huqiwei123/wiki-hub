"use client";

import { useState } from "react";
import { ArrowRight, Code2, SlidersHorizontal } from "lucide-react";
import { FilterBar, PageHero, Pagination } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { categories } from "@/lib/static-content";

const FILTERS = ["All", "Development", "Infrastructure", "Frontend", "AI & ML"];

export default function CategoriesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = activeFilter === "All"
    ? categories
    : categories.filter((c) => c.name.includes(activeFilter) || activeFilter.includes(c.name.split(" ")[0]));

  const perPage = 4;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="w-full pb-16">
      <PageHero title="Categories" subtitle="Browse content organized by topic and domain" />
      <Container>
        <div className="mt-7">
          <FilterBar filters={FILTERS} activeFilter={activeFilter} onFilter={setActiveFilter} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {paged.map((cat) => (
            <article key={cat.name} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="grid size-[52px] place-items-center rounded-xl" style={{ backgroundColor: cat.bg, color: cat.color }}>
                    <Code2 className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-bold text-foreground">{cat.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{cat.count} Articles</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                Programming languages, frameworks, architecture patterns, and development best practices. Covers everything from TypeScript to system design.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {cat.tags.map((tag) => (
                  <span key={tag} className="inline-flex h-6 items-center rounded-md bg-muted px-2 text-[11px] font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </Container>
    </div>
  );
}
