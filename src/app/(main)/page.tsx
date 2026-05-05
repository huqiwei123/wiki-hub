import Link from "next/link";
import { ArrowRight, BookOpen, GitBranch } from "lucide-react";
import { ArticleCard, CompactCategoryCard, SectionHeader } from "@/components/wikihub/ui";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/layout/container";
import { getRecentPosts } from "@/queries/posts";
import { getAllCategories } from "@/queries/categories";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    getRecentPosts(3),
    getAllCategories(),
  ]);

  const totalPosts = 142;
  const totalTags = 48;
  const totalLinks = 256;

  return (
    <div className="w-full">
      <section className="w-full border-b border-border bg-muted/75 py-12 text-center backdrop-blur-xl">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto inline-flex h-7 items-center rounded-full bg-accent/15 px-3 text-xs font-medium text-accent">
              Personal Knowledge Base
            </div>
            <h1 className="mx-auto mt-5 max-w-2xl text-5xl font-extrabold tracking-tight text-foreground">
              Explore, Learn &amp; Connect Ideas
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
              A curated collection of technical insights, deep dives, and interconnected knowledge. Discover patterns across topics through bidirectional links and visual exploration.
            </p>
            <div className="mt-6 flex justify-center gap-8 text-xs text-muted-foreground">
              <span>{totalPosts} Articles</span>
              <span>{totalTags} Tags</span>
              <span>{totalLinks} Links</span>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <SectionHeader
          title="Featured Articles"
          subtitle="Latest technical insights and tutorials"
          action={
            <Link href="/blog" className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground">
              View all <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard
              key={post.slug}
              article={{
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                category: post.categories?.name ?? null,
                cover_image: post.cover_image,
                published_at: post.published_at,
                reading_time: post.reading_time,
              }}
            />
          ))}
        </div>
      </Container>

      <Container className="pb-10">
        <SectionHeader title="Browse by Category" subtitle="Explore content organized by technical domain" />
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((cat) => (
            <CompactCategoryCard key={cat.slug} item={cat} />
          ))}
        </div>
      </Container>

      <Container className="pb-12">
        <SectionHeader
          title="Explore the Knowledge Graph"
          subtitle="Discover connections between articles and ideas"
          action={
            <Link href="/graph" className="inline-flex h-9 items-center rounded-md bg-muted px-4 text-xs font-medium text-muted-foreground">
              View full graph
            </Link>
          }
        />
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative h-[400px] overflow-hidden rounded-lg border border-border bg-card/90 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(37,99,235,0.16),transparent_28%),radial-gradient(circle_at_70%_66%,rgba(20,184,166,0.16),transparent_30%)]" />
            <div className="absolute left-[24%] top-[32%] h-px w-[42%] rotate-[15deg] bg-blue-200" />
            <div className="absolute left-[36%] top-[58%] h-px w-[30%] rotate-[-35deg] bg-teal-200" />
            {["Articles", "Tags", "Ideas"].map((label, index) => (
              <div
                key={label}
                className="absolute rounded-2xl border border-border/80 bg-card/85 px-5 py-4 text-center shadow-lg backdrop-blur-xl"
                style={{
                  left: index === 0 ? "20%" : index === 1 ? "60%" : "42%",
                  top: index === 0 ? "26%" : index === 1 ? "34%" : "62%",
                }}
              >
                <span className={`mx-auto block size-3 rounded-full ${index === 0 ? "bg-blue-600" : index === 1 ? "bg-teal-600" : "bg-orange-500"}`} />
                <span className="mt-2 block text-xs font-semibold text-muted-foreground">{label}</span>
              </div>
            ))}
            <GitBranch className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-blue-300" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-lg font-bold text-foreground">Connected Ideas</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Explore relationships between articles through bidirectional links. Find clusters of related concepts and discover new paths through your knowledge base.
            </p>
            <div className="mt-6 grid gap-3 text-xs text-muted-foreground">
              {["256 connections between articles", "48 emerging topic clusters", "12 orphan articles waiting for connections"].map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${index === 0 ? "bg-blue-600" : index === 1 ? "bg-emerald-600" : "bg-red-600"}`} />
                  {item}
                </div>
              ))}
            </div>
            <Link href="/graph" className="mt-7 inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
              <BookOpen className="size-4" />
              Open Knowledge Graph
            </Link>
          </div>
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
}
