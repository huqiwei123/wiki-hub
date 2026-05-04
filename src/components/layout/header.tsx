"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, FolderTree, GitBranch, Info, Search, Tags } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navIcons = {
  "/blog": BookOpenText,
  "/tags": Tags,
  "/categories": FolderTree,
  "/graph": GitBranch,
  "/about": Info,
};

export function Header() {
  const pathname = usePathname();

  return (
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
            className="hidden h-9 items-center gap-2 rounded-lg bg-muted px-3 text-xs text-muted-foreground sm:inline-flex"
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
