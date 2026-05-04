import { BookOpen, Check, Minus, Plus, RotateCcw, Search } from "lucide-react";
import type React from "react";
import { GraphPlaceholder, PageHero } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { categories, graphStats } from "@/lib/static-content";

export default function GraphPage() {
  return (
    <div className="w-full pb-16">
      <PageHero title="Knowledge Graph" subtitle="Explore connections between articles, topics, and ideas" />
      <Container>

      <div className="mt-7 grid gap-7 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <SidebarSection title="Search">
            <div className="flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground">
              <Search className="size-4" />
              Search for topics or articles...
            </div>
          </SidebarSection>

          <SidebarSection title="Filter by Category">
            <div className="rounded-lg border border-border bg-card p-2">
              {["All Categories", ...categories.slice(0, 4).map((cat) => cat.name)].map((item, index) => (
                <div key={item} className={`flex h-10 items-center gap-3 rounded-md px-3 text-xs ${index === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  <span className={`grid size-4 place-items-center rounded border ${index === 0 ? "border-primary-foreground bg-primary-foreground text-primary" : "border-border"}`}>
                    {index === 0 && <Check className="size-3" />}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="Graph Statistics">
            <div className="grid gap-3">
              {graphStats.map((stat) => (
                <div key={stat.label} className="h-[72px] rounded-lg border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-foreground">{stat.value}</span>
                    <span className="size-3 rounded-full" style={{ backgroundColor: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </SidebarSection>
        </aside>

        <section className="space-y-5">
          <div className="flex h-[52px] items-center justify-between rounded-lg border border-border bg-card px-3 shadow-sm">
            <div className="flex gap-2">
              {[Minus, Plus].map((Icon, index) => (
                <button key={index} className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </button>
              ))}
              <button className="inline-flex h-8 items-center gap-2 rounded-md bg-muted px-3 text-xs font-medium text-muted-foreground">
                <RotateCcw className="size-4" />
                Reset View
              </button>
            </div>
            <div className="flex gap-2">
              <button className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">Force Directed</button>
              <button className="h-8 rounded-md bg-muted px-3 text-xs font-medium text-muted-foreground">Show Labels</button>
            </div>
          </div>
          <GraphPlaceholder className="h-[700px]" />
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Selected Article</h2>
              <span className="text-muted-foreground">×</span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-lg bg-accent/15 text-accent">
                <BookOpen className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-foreground">Deep Dive into TypeScript 5.0 Decorators</h3>
                <p className="mt-1 text-xs text-muted-foreground">Exploring the new ECMAScript decorators standard and how it transforms the way we write TypeScript applications.</p>
                <span className="mt-3 inline-flex h-6 items-center rounded-md bg-accent px-2 text-[11px] font-medium text-accent-foreground">Development</span>
              </div>
              <div className="flex gap-2">
                <button className="h-9 rounded-md bg-muted px-4 text-xs font-medium text-muted-foreground">View Article</button>
                <button className="h-9 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground">Open in Graph</button>
              </div>
            </div>
          </div>
        </section>
      </div>
      </Container>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
