import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
import { PageHero } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { getAllCategories } from "@/queries/categories";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="w-full pb-16">
      <PageHero title="Categories" subtitle="Browse content organized by topic and domain" />
      <Container>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog?category=${cat.slug}`}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span className="grid size-[52px] place-items-center rounded-xl bg-accent/15 text-accent">
                      <Code2 className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-bold text-foreground">{cat.name}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {cat.post_count ?? 0} Articles
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
                {cat.description && (
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">{cat.description}</p>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-2 py-12 text-center text-sm text-muted-foreground">
              No categories yet.
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
