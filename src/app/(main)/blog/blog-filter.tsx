"use client";

import { useRouter } from "next/navigation";
import { FilterBar } from "@/components/wikihub/ui";

interface BlogFilterBarProps {
  categories: Array<{ slug: string; name: string }>;
  activeCategory: string | null;
}

export function BlogFilterBar({ categories, activeCategory }: BlogFilterBarProps) {
  const router = useRouter();

  const filters = ["All", ...categories.map((c) => c.name)];
  const activeFilter = activeCategory
    ? categories.find((c) => c.slug === activeCategory)?.name ?? "All"
    : "All";

  const handleFilter = (name: string) => {
    if (name === "All") {
      router.push("/blog");
    } else {
      const slug = categories.find((c) => c.name === name)?.slug;
      if (slug) router.push(`/blog?category=${slug}`);
    }
  };

  return (
    <FilterBar
      filters={filters}
      activeFilter={activeFilter}
      onFilter={handleFilter}
    />
  );
}
