"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Check, Minus, Plus, RotateCcw, X } from "lucide-react";
import type React from "react";
import { PageHero, SearchBox } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import dynamic from "next/dynamic";
import type { ForceGraphHandle } from "@/components/knowledge/graph";

const ForceGraph = dynamic(
  () => import("@/components/knowledge/graph").then((mod) => ({ default: mod.ForceGraph })),
  { ssr: false, loading: () => <div className="flex h-[700px] items-center justify-center rounded-lg border border-border bg-card/90 text-sm text-muted-foreground">Loading graph...</div> }
);
import { getAllGraphData } from "@/queries/graph";
import { getAllCategories } from "@/queries/categories";

interface GraphData {
  nodes: Array<{ id: string; label: string; group: string }>;
  edges: Array<{ source: string; target: string }>;
}

export default function GraphPage() {
  const [data, setData] = useState<GraphData>({ nodes: [], edges: [] });
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"force" | "labels">("force");
  const [selectedArticle, setSelectedArticle] = useState<{ id: string; label: string } | null>(null);
  const graphRef = useRef<ForceGraphHandle>(null);

  useEffect(() => {
    Promise.all([getAllGraphData(), getAllCategories()]).then(([graphData, cats]) => {
      setData(graphData);
      setCategories(cats.map((c) => ({ name: c.name, slug: c.slug })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categoryItems = useMemo(
    () => ["All Categories", ...categories.map((c) => c.name)],
    [categories]
  );

  const filteredNodes = useMemo(() => {
    if (activeCategory === "All Categories") return data.nodes;
    return data.nodes.filter((n) => n.group === activeCategory);
  }, [data.nodes, activeCategory]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return data.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [data.edges, filteredNodes]);

  const graphStats = [
    { label: "Total Articles", value: data.nodes.length, color: "#2563eb" },
    { label: "Total Connections", value: data.edges.length, color: "#059669" },
    { label: "Orphan Articles", value: data.nodes.length - new Set(data.edges.flatMap((e) => [e.source, e.target])).size, color: "#dc2626" },
  ];

  return (
    <div className="w-full pb-16">
      <PageHero title="Knowledge Graph" subtitle="Explore connections between articles, topics, and ideas" />
      <Container>
        <div className="mt-7 grid gap-7 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <SidebarSection title="Search">
              <SearchBox placeholder="Search for topics or articles..." value={search} onChange={setSearch} />
            </SidebarSection>

            <SidebarSection title="Filter by Category">
              <div className="rounded-lg border border-border bg-card p-2">
                {categoryItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveCategory(item)}
                    className={`flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-xs transition-colors ${item === activeCategory ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <span className={`grid size-4 place-items-center rounded border ${item === activeCategory ? "border-primary-foreground bg-primary-foreground text-primary" : "border-border"}`}>
                      {item === activeCategory && <Check className="size-3" />}
                    </span>
                    {item}
                  </button>
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
                <button onClick={() => graphRef.current?.zoomOut()} className="grid size-8 cursor-pointer place-items-center rounded-md bg-muted text-muted-foreground hover:bg-muted/80">
                  <Minus className="size-4" />
                </button>
                <button onClick={() => graphRef.current?.zoomIn()} className="grid size-8 cursor-pointer place-items-center rounded-md bg-muted text-muted-foreground hover:bg-muted/80">
                  <Plus className="size-4" />
                </button>
                <button onClick={() => graphRef.current?.zoomReset()} className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md bg-muted px-3 text-xs font-medium text-muted-foreground hover:bg-muted/80">
                  <RotateCcw className="size-4" />
                  Reset View
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("force")}
                  className={`h-8 cursor-pointer rounded-md px-3 text-xs font-medium ${viewMode === "force" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  Force Directed
                </button>
                <button
                  onClick={() => setViewMode(viewMode === "labels" ? "force" : "labels")}
                  className={`h-8 cursor-pointer rounded-md px-3 text-xs font-medium ${viewMode === "labels" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  Show Labels
                </button>
              </div>
            </div>
            {loading ? (
              <div className="flex h-[700px] items-center justify-center rounded-lg border border-border bg-card/90 text-sm text-muted-foreground">
                Loading graph...
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-card/90 backdrop-blur-xl">
                <ForceGraph ref={graphRef} nodes={filteredNodes} edges={filteredEdges} onNodeClick={(id, label) => setSelectedArticle({ id, label })} />
              </div>
            )}
            {selectedArticle && (
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Selected Article</h2>
                  <button onClick={() => setSelectedArticle(null)} className="cursor-pointer text-muted-foreground hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                    <BookOpen className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground">{selectedArticle.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Click on a node in the graph to view the article details.</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/blog/${selectedArticle.id}`} className="inline-flex h-9 cursor-pointer items-center rounded-md bg-muted px-4 text-xs font-medium text-muted-foreground">View Article</Link>
                  </div>
                </div>
              </div>
            )}
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
