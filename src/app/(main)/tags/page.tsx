import { ArrowUpRight, Hash, Search, SlidersHorizontal, Tag } from "lucide-react";
import type React from "react";
import { FilterButton, PageHero } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { tags } from "@/lib/static-content";

export default function TagsPage() {
  return (
    <div className="w-full pb-16">
      <PageHero title="Tags" subtitle="Explore content by specific topics and keywords" />
      <Container>

      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <StatCard icon={<Tag className="size-4 text-blue-600" />} label="Total Tags" value="142" />
        <StatCard icon={<Hash className="size-4 text-emerald-600" />} label="Tagged Articles" value="328" />
        <StatCard icon={<ArrowUpRight className="size-4 text-red-600" />} label="Popular Tag" value="TypeScript" />
      </div>

      <div className="mt-6 flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <SlidersHorizontal className="size-4 text-slate-500" />
        <span className="text-xs text-slate-500">Sort by:</span>
        <FilterButton active>Most Popular</FilterButton>
        <FilterButton>A-Z</FilterButton>
        <FilterButton>Z-A</FilterButton>
        <FilterButton>Newest</FilterButton>
        <div className="ml-auto hidden h-8 items-center gap-2 rounded-lg bg-muted px-3 text-xs text-slate-500 sm:flex">
          <Search className="size-4" />
          Search tags...
        </div>
      </div>

      <section className="mt-7">
        <h2 className="text-sm font-bold text-slate-950">Popular Tags</h2>
        <div className="mt-4 rounded-xl border border-border bg-white p-7">
          <div className="flex flex-wrap gap-3">
            {tags.map(([name, count, color, bg], index) => (
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
        <h2 className="text-sm font-bold text-slate-950">All Tags</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {tags.slice(0, 12).map(([name, count, color]) => (
            <div key={name} className="flex h-16 items-center justify-between rounded-lg border border-border bg-white px-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium text-slate-950">{name}</span>
              </div>
              <span className="text-xs text-slate-400">{count} articles</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex justify-center gap-2">
        {["‹", "1", "2", "3", "›"].map((item) => (
          <button key={item} className={`grid size-9 place-items-center rounded-lg text-xs font-medium ${item === "1" ? "bg-blue-600 text-white" : "bg-muted text-slate-600"}`}>
            {item}
          </button>
        ))}
      </div>
      </Container>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="h-[100px] rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</div>
      <div className="mt-3 text-3xl font-extrabold text-slate-950">{value}</div>
    </div>
  );
}
