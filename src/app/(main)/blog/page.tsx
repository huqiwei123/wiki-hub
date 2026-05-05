"use client";

import { useState } from "react";
import { ArticleCard, FilterBar, PageHero, Pagination, SectionHeader } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { articles } from "@/lib/static-content";

const FILTERS = ["All", "Development", "Infrastructure", "Frontend", "AI & ML"];

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);

  const allArticles = [...articles, ...articles];
  const perPage = 6;
  const totalPages = Math.ceil(allArticles.length / perPage);
  const paged = allArticles.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="w-full pb-16">
      <PageHero title="Articles" subtitle="Browse technical notes, tutorials, and connected essays" />
      <Container>
        <div className="mt-8">
          <FilterBar filters={FILTERS} activeFilter={activeFilter} onFilter={setActiveFilter} />
        </div>
        <div className="mt-8">
          <SectionHeader title="Latest Articles" subtitle="Static demo data for the Pencil UI pass" />
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {paged.map((article, index) => (
              <ArticleCard key={`${article.title}-${index}`} article={article} />
            ))}
          </div>
        </div>
        <div className="mt-10">
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </Container>
    </div>
  );
}
