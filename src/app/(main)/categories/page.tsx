import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIconBadge, PageHero } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { getCategoryStyle } from "@/lib/category-style";
import { getAllCategories } from "@/queries/categories";

function categoryGradient(i: number) {
  const c = getCategoryStyle("", i);
  return `linear-gradient(135deg, ${c.bg}, transparent)` as const;
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="w-full pb-16">
      <PageHero title="Categories" subtitle="Browse content organized by topic and domain" />
      <Container>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {categories.length > 0 ? (
            categories.map((cat, i) => {
              return (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className="group glass-panel relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(17,24,39,0.16)] dark:hover:shadow-[0_30px_100px_rgba(0,0,0,0.34)]"
                  style={{ backgroundImage: categoryGradient(i) }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <CategoryIconBadge slug={cat.slug} index={i} className="size-[56px] rounded-2xl" />
                      <div>
                        <h2 className="font-bold text-foreground transition-colors group-hover:text-primary">{cat.name}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {cat.post_count ?? 0} Articles
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  {cat.description && (
                    <p className="mt-5 text-sm leading-6 text-muted-foreground">{cat.description}</p>
                  )}
                </Link>
              );
            })
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
