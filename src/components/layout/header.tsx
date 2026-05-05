"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, BookOpenText, FolderTree, GitBranch, Info, Search, Tags } from "lucide-react";
import { Command } from "cmdk";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navIcons = {
  "/blog": BookOpenText,
  "/tags": Tags,
  "/categories": FolderTree,
  "/graph": GitBranch,
  "/bookmarks": Bookmark,
  "/about": Info,
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ slug: string; title: string; excerpt: string | null }>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      setResults(json.results ?? []);
    } catch {
      setResults([]);
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(value), 250);
  }, [doSearch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
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
          <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
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
        <nav aria-label="Mobile navigation" className="flex gap-5 overflow-x-auto border-b border-border bg-card/90 px-6 py-3 backdrop-blur-xl md:hidden">
          {siteConfig.nav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} compact />
          ))}
        </nav>
      </header>

      <Command.Dialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        label="Search articles"
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
        <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Search articles..."
              value={query}
              onValueChange={handleInputChange}
              className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Esc</kbd>
          </div>
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">
              {query.length < 2 ? "Type to search articles..." : "No articles found."}
            </Command.Empty>
            {results.map((r) => (
              <Command.Item
                key={r.slug}
                value={r.title}
                onSelect={() => {
                  router.push(`/blog/${r.slug}`);
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="flex cursor-pointer flex-col rounded-md px-3 py-2.5 text-sm text-foreground aria-selected:bg-muted"
              >
                <span className="font-medium">{r.title}</span>
                {r.excerpt && <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.excerpt}</span>}
              </Command.Item>
            ))}
            {query.trim().length >= 2 && (
              <Command.Item
                value={`search:${query}`}
                onSelect={() => {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="mt-1 flex cursor-pointer items-center justify-between rounded-md border-t border-border px-3 py-2.5 pt-3 text-sm text-muted-foreground aria-selected:bg-muted"
              >
                <span>
                  View all results for &ldquo;{query.trim()}&rdquo;
                </span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Enter</kbd>
              </Command.Item>
            )}
          </Command.List>
        </div>
      </Command.Dialog>
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
      aria-current={active ? "page" : undefined}
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
