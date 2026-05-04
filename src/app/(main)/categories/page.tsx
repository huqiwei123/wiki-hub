import { ArrowRight, Code2, SlidersHorizontal } from "lucide-react";
import { FilterButton, PageHero } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { categories } from "@/lib/static-content";

export default function CategoriesPage() {
  return (
    <div className="w-full pb-16">
      <PageHero title="Categories" subtitle="Browse content organized by topic and domain" />
      <Container>
      <div className="mt-7 flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <SlidersHorizontal className="size-4 text-slate-500" />
        <span className="text-xs text-slate-500">Filter by:</span>
        <FilterButton active>All</FilterButton>
        <FilterButton>Development</FilterButton>
        <FilterButton>Infrastructure</FilterButton>
        <FilterButton>Frontend</FilterButton>
        <FilterButton>AI &amp; ML</FilterButton>
        <span className="ml-auto text-xs text-slate-500">Sort by: Articles Count</span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {categories.map((cat) => (
          <article key={cat.name} className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className="grid size-[52px] place-items-center rounded-xl" style={{ backgroundColor: cat.bg, color: cat.color }}>
                  <Code2 className="size-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">{cat.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">{cat.count} Articles</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-slate-400" />
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-500">
              Programming languages, frameworks, architecture patterns, and development best practices. Covers everything from TypeScript to system design.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {cat.tags.map((tag) => (
                <span key={tag} className="inline-flex h-6 items-center rounded-md bg-muted px-2 text-[11px] font-medium text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <Pagination />
      </Container>
    </div>
  );
}

function Pagination() {
  return (
    <div className="mt-10 flex justify-center gap-2">
      {["‹", "1", "2", "3", "›"].map((item) => (
        <button key={item} className={`grid size-9 place-items-center rounded-lg text-xs font-medium ${item === "1" ? "bg-blue-600 text-white" : "bg-muted text-slate-600"}`}>
          {item}
        </button>
      ))}
    </div>
  );
}
