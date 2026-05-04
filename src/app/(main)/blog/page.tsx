import { ArticleCard, FilterButton, PageHero, SectionHeader } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { articles } from "@/lib/static-content";

export default function BlogPage() {
  return (
    <div className="w-full pb-16">
      <PageHero title="Articles" subtitle="Browse technical notes, tutorials, and connected essays" />
      <Container>
      <div className="mt-8 flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <span className="text-xs text-slate-500">Filter by:</span>
        <FilterButton active>All</FilterButton>
        <FilterButton>Development</FilterButton>
        <FilterButton>Infrastructure</FilterButton>
        <FilterButton>Frontend</FilterButton>
        <FilterButton>AI &amp; ML</FilterButton>
        <span className="ml-auto text-xs text-slate-500">Sort by: Latest</span>
      </div>
      <div className="mt-8">
        <SectionHeader title="Latest Articles" subtitle="Static demo data for the Pencil UI pass" />
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          {[...articles, ...articles].map((article, index) => (
            <ArticleCard key={`${article.title}-${index}`} article={article} />
          ))}
        </div>
      </div>
      </Container>
    </div>
  );
}
