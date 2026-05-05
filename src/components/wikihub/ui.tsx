"use client";

import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { ArrowRight, Calendar, Code2, Database, GitBranch, Package, Search } from "lucide-react";
import { articles, categories } from "@/lib/static-content";
import { Container } from "@/components/layout/container";

export function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="w-full border-b border-border bg-muted/75 py-12 text-center backdrop-blur-xl">
      <Container>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </Container>
    </section>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ArticleCard({ article = articles[0] }: { article?: (typeof articles)[number] }) {
  const Icon = article.icon === "database" ? Database : article.icon === "component" ? Package : Code2;

  return (
    <Link href="/blog/deep-dive" className="overflow-hidden rounded-lg border border-border bg-card/90 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`relative grid h-[200px] overflow-hidden place-items-center bg-gradient-to-br ${article.gradient} text-white`}>
        {"image" in article && article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <Icon className="size-8 opacity-80" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 to-white/0" />
      </div>
      <div className="p-5">
        <span className="inline-flex h-6 items-center rounded-md bg-accent/15 px-2 text-[11px] font-medium text-accent">{article.category}</span>
        <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-foreground">{article.title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{article.excerpt}</p>
        <div className="mt-5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {article.date}
          </span>
          <span>{article.read}</span>
        </div>
      </div>
    </Link>
  );
}

export function CompactCategoryCard({ item = categories[0] }: { item?: (typeof categories)[number] }) {
  return (
    <Link href="/categories" className="rounded-lg border border-border bg-card/90 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-lg" style={{ backgroundColor: item.bg, color: item.color }}>
          <Code2 className="size-5" />
        </span>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
      <h3 className="mt-5 font-bold text-foreground">{item.name}</h3>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
        Programming tutorials, infrastructure guides, frontend patterns, and development best practices.
      </p>
      <p className="mt-4 text-[11px] text-muted-foreground">{item.count} articles</p>
    </Link>
  );
}

export function FilterButton({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 cursor-pointer rounded-md px-3 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
    >
      {children}
    </button>
  );
}

export function SearchBox({ placeholder = "Search...", value = "", onChange }: { placeholder?: string; value?: string; onChange?: (value: string) => void }) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-lg bg-muted px-3 text-xs text-muted-foreground">
      <Search className="size-4 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function FilterBar({ filters, activeFilter, onFilter }: { filters: string[]; activeFilter: string; onFilter: (f: string) => void }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-3">
      <span className="mr-1 text-xs text-muted-foreground">Filter by:</span>
      {filters.map((f) => (
        <FilterButton key={f} active={activeFilter === f} onClick={() => onFilter(f)}>
          {f}
        </FilterButton>
      ))}
    </div>
  );
}

export function SortBar({ options, activeOption, onSort }: { options: string[]; activeOption: string; onSort: (o: string) => void }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-3">
      <span className="mr-1 text-xs text-muted-foreground">Sort by:</span>
      {options.map((o) => (
        <FilterButton key={o} active={activeOption === o} onClick={() => onSort(o)}>
          {o}
        </FilterButton>
      ))}
    </div>
  );
}

export function Pagination({ current = 1, total = 3, onChange }: { current?: number; total?: number; onChange?: (page: number) => void }) {
  const [page, setPage] = useState(current);

  const go = (p: number) => {
    if (p < 1 || p > total) return;
    setPage(p);
    onChange?.(p);
  };

  return (
    <div className="flex justify-center gap-2">
      <button onClick={() => go(page - 1)} className="grid size-9 cursor-pointer place-items-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">‹</button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => go(p)}
          className={`grid size-9 cursor-pointer place-items-center rounded-lg text-xs font-medium ${p === page ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          {p}
        </button>
      ))}
      <button onClick={() => go(page + 1)} className="grid size-9 cursor-pointer place-items-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">›</button>
    </div>
  );
}

export function GraphPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-border bg-card/90 backdrop-blur-xl ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_28%,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_70%_62%,rgba(20,184,166,0.14),transparent_30%)]" />
      <div className="absolute left-[24%] top-[30%] h-px w-[38%] rotate-[18deg] bg-blue-200" />
      <div className="absolute left-[34%] top-[58%] h-px w-[34%] rotate-[-32deg] bg-teal-200" />
      <div className="absolute left-[52%] top-[36%] h-px w-[28%] rotate-[62deg] bg-orange-200" />
      {[
        ["Articles", "left-[18%] top-[24%]", "bg-blue-600"],
        ["Tags", "right-[18%] top-[30%]", "bg-teal-600"],
        ["Categories", "left-[36%] bottom-[20%]", "bg-orange-500"],
        ["Ideas", "right-[28%] bottom-[24%]", "bg-violet-600"],
      ].map(([label, position, color]) => (
        <div key={label} className={`absolute ${position} rounded-2xl border border-border bg-card/80 px-5 py-4 text-center shadow-lg backdrop-blur-xl`}>
          <span className={`mx-auto block size-3 rounded-full ${color}`} />
          <span className="mt-2 block text-xs font-semibold text-foreground">{label}</span>
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-8 text-center text-muted-foreground">
        <GitBranch className="mx-auto size-8 opacity-40" />
        <p className="mt-2 text-xs font-medium">Interactive knowledge graph preview</p>
      </div>
    </div>
  );
}
