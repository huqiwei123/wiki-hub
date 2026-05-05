import { Suspense } from "react";
import { PostCard } from "@/components/blog/post-card";
import { FilterBar, PageHero, SectionHeader } from "@/components/wikihub/ui";
import { Container } from "@/components/layout/container";
import { getPublishedPosts, getPostsByCategory } from "@/queries/posts";
import { getAllCategories } from "@/queries/categories";
import { BlogFilterBar } from "./blog-filter";
import { BlogPagination } from "./blog-pagination";

type SearchParams = Promise<{ category?: string; page?: string }>;

type Props = {
  searchParams: SearchParams;
};

export default async function BlogPage({ searchParams }: Props) {
  const { category, page: pageParam } = await searchParams;
  const currentPage = parseInt(pageParam ?? "1");
  const pageSize = 6;

  const [{ posts, total }, categories] = await Promise.all([
    category
      ? getPostsByCategory(category, currentPage, pageSize)
      : getPublishedPosts(currentPage, pageSize),
    getAllCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filterNames = ["All", ...categories.map((c) => c.name)];
  const activeFilterName = category
    ? categories.find((c) => c.slug === category)?.name ?? "All"
    : "All";

  return (
    <div className="w-full pb-16">
      <PageHero title="Articles" subtitle="Browse technical notes, tutorials, and connected essays" />
      <Container>
        <div className="mt-8">
          <BlogFilterBar
            categories={categories}
            activeCategory={category ?? null}
          />
        </div>
        <div className="mt-8">
          <SectionHeader
            title={category ? `${activeFilterName} Articles` : "Latest Articles"}
            subtitle={total > 0 ? `${total} article${total !== 1 ? "s" : ""} found` : "No articles yet"}
          />
          {posts.length > 0 ? (
            <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center text-sm text-muted-foreground">
              No articles found in this category.
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="mt-10">
            <Suspense>
              <BlogPagination current={currentPage} total={totalPages} />
            </Suspense>
          </div>
        )}
      </Container>
    </div>
  );
}
