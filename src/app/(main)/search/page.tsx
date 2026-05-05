import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/wikihub/ui";
import { searchPosts } from "@/queries/search";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query.length >= 2 ? await searchPosts(query, 20) : [];

  return (
    <div className="w-full pb-16">
      <PageHero title="Search" subtitle="Find articles across the knowledge base" />
      <Container className="pt-8">
        <form className="mx-auto flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-card/90 p-2 shadow-sm backdrop-blur-xl">
          <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search articles, tags, or topics..."
            className="h-11 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Search
          </button>
        </form>

        <div className="mx-auto mt-8 max-w-2xl">
          {query.length < 2 ? (
            <p className="text-center text-sm text-muted-foreground">
              Enter at least two characters to search published articles.
            </p>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
              </p>
              {results.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block rounded-xl border border-border bg-card/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h2 className="text-base font-semibold text-foreground">{post.title}</h2>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No articles found for &quot;{query}&quot;.
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
