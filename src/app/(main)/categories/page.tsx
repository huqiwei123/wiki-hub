import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { getAllCategories } from "@/queries/categories";

const ACCENT_COLORS = [
  { bg: "#2563eb18", text: "#2563eb" },
  { bg: "#05966918", text: "#059669" },
  { bg: "#7c3aed18", text: "#7c3aed" },
  { bg: "#d9770618", text: "#d97706" },
  { bg: "#db277718", text: "#db2777" },
  { bg: "#0284c718", text: "#0284c7" },
];

function categoryGradient(i: number) {
  const c = ACCENT_COLORS[i % ACCENT_COLORS.length];
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
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className="group glass-panel relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(17,24,39,0.16)] dark:hover:shadow-[0_30px_100px_rgba(0,0,0,0.34)]"
                  style={{ backgroundImage: categoryGradient(i) }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <span
                        className="grid size-[52px] place-items-center rounded-xl text-lg font-bold transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: accent.bg, color: accent.text }}
                      >
                        {cat.name[0]}
                      </span>
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
