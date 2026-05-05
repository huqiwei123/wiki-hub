"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, BookOpenText, FolderTree, GitBranch, Info, Search, Tags } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { articles } from "@/lib/static-content";

const navIcons = {
  "/blog": BookOpenText,
  "/tags": Tags,
  "/categories": FolderTree,
  "/graph": GitBranch,
  "/about": Info,
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = query
    ? articles
        .filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const close = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 h-16 w-full border-b border-border bg-card/90 backdrop-blur-xl">
        <Container className="flex h-full items-center justify-between">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-5 shrink-0 place-items-center rounded-[5px] border border-accent text-accent">
              <BookOpenText className="size-3.5" />
            </span>
            <span className="truncate text-sm font-bold leading-tight">{siteConfig.name}</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {siteConfig.nav.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 cursor-pointer items-center gap-2 rounded-lg bg-muted px-3 text-xs text-muted-foreground hover:bg-muted/80 sm:inline-flex"
            >
              <Search className="size-4" />
              <span>Search...</span>
              <kbd className="rounded bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">Ctrl K</kbd>
            </button>
            <ThemeToggle />
          </div>
        </Container>
        <nav className="flex gap-5 overflow-x-auto border-b border-border bg-card/90 px-6 py-3 backdrop-blur-xl md:hidden">
          {siteConfig.nav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} compact />
          ))}
        </nav>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search articles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length > 0) {
                    router.push(`/blog`);
                    close();
                  }
                }}
              />
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Esc</kbd>
            </div>
            {filtered.length > 0 ? (
              <div className="py-2">
                {filtered.map((article) => (
                  <Link
                    key={article.title}
                    href={`/blog/${article.slug}`}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                  >
                    <span className="flex-1 truncate">{article.title}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : query ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No articles found.</div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">Type to search articles...</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({
  item,
  active,
  compact = false,
}: {
  item: (typeof siteConfig.nav)[number];
  active: boolean;
  compact?: boolean;
}) {
  const Icon = navIcons[item.href as keyof typeof navIcons] ?? BookOpenText;

  return (
    <Link
      href={item.href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
        active && "text-foreground",
        compact && "text-sm"
      )}
    >
      <Icon className="size-3.5" />
      {item.label}
    </Link>
  );
}
