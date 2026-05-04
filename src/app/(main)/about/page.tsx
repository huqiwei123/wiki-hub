import { ArrowRight, Code2, GitBranch, Globe2, Search, Shield, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";

const features = [
  { icon: Code2, title: "MDX Writing Experience", text: "Write articles in Markdown with MDX support for interactive components, code snippets with syntax highlighting, and custom styling.", color: "#2563eb" },
  { icon: GitBranch, title: "Bidirectional Linking", text: "Automatically creates links between related articles using [[wiki links]] syntax, and visualize connections in the knowledge graph.", color: "#059669" },
  { icon: Sparkles, title: "Knowledge Graph", text: "Interactive force-directed graph visualization to explore connections between articles, discover new relationships, and navigate your knowledge base.", color: "#dc2626" },
  { icon: Search, title: "Full-Text Search", text: "Powerful search functionality built on PostgreSQL full-text search capabilities, with fuzzy matching and semantic search to quickly find what you're looking for.", color: "#f97316" },
  { icon: Shield, title: "Dark Mode Support", text: "Full dark mode support with carefully designed color palettes that meet WCAG accessibility standards for both light and dark themes.", color: "#7c3aed" },
  { icon: Globe2, title: "SEO Optimized", text: "Built-in SEO optimization with automatic metadata generation, JSON-LD structured data, sitemap generation, and Open Graph tags for better search engine visibility.", color: "#16a34a" },
];

const tech = [
  ["Next.js", "#000000"],
  ["TypeScript", "#3178c6"],
  ["Supabase", "#3ecf8e"],
  ["Tailwind CSS", "#06b6d4"],
  ["MDX", "#f97316"],
  ["Shadcn/ui", "#6366f1"],
  ["PostgreSQL", "#165dff"],
  ["Vercel", "#000000"],
];

export default function AboutPage() {
  return (
    <Container className="pb-16">
      <section className="w-full py-14 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">About WikiHub</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600">
          A personal knowledge base and blogging platform built for learning and sharing.
        </p>
      </section>

      <section className="mx-auto max-w-[900px]">
        <h2 className="text-xl font-extrabold text-slate-950">Key Features</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="min-h-[220px] rounded-xl border border-border bg-white p-6 shadow-sm">
              <feature.icon className="size-6" style={{ color: feature.color }} />
              <h3 className="mt-6 font-bold text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-[900px]">
        <h2 className="text-xl font-extrabold text-slate-950">Built With</h2>
        <div className="mt-5 flex max-w-xl flex-wrap gap-3">
          {tech.map(([name, color]) => (
            <span key={name} className="inline-flex h-10 items-center rounded-full px-4 text-xs font-bold text-white" style={{ backgroundColor: color }}>
              {name}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-[900px]">
        <h2 className="text-xl font-extrabold text-slate-950">Open Source</h2>
        <div className="mt-4 max-w-md text-sm leading-7 text-slate-600">
          WikiHub is completely open source and available on GitHub under the MIT license. You are free to use, modify, and self-host it for your own personal knowledge base or blog.
        </div>
        <div className="mt-6 flex gap-3">
          <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-medium text-white">
            <span className="text-xs font-bold">GH</span>
            View on GitHub
          </button>
          <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-muted px-5 text-sm font-medium text-slate-700">
            <ArrowRight className="size-4" />
            Star the Project
          </button>
        </div>
      </section>
    </Container>
  );
}
