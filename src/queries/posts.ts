import { createClient } from "@/lib/supabase/server";
import { publicSupabase, withTimeoutSignal } from "@/lib/supabase/public";
import type { Post } from "@/types";
import { cache } from "react";

type PostTagJoin = { tag?: Post["tags"][number] | null } | Post["tags"][number];
type PostQueryRow = Omit<Post, "tags"> & {
  tags?: PostTagJoin[] | null;
};

function isPostTagJoin(value: PostTagJoin): value is { tag?: Post["tags"][number] | null } {
  return typeof value === "object" && value !== null && "tag" in value;
}

function flattenPostTags(row: PostQueryRow): Post {
  if (row.tags && Array.isArray(row.tags)) {
    return {
      ...row,
      tags: row.tags
        .map((tagRow) => (isPostTagJoin(tagRow) ? tagRow.tag : tagRow))
        .filter((tag): tag is Post["tags"][number] => Boolean(tag)),
    };
  }
  return { ...row, tags: [] };
}

export const getPublishedPosts = cache(
  async (page = 1, pageSize = 10) => {
    const timeout = withTimeoutSignal();
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await publicSupabase
        .from("posts")
        .select("*, categories(*), tags:post_tags(tag:tags(*)), profiles!posts_author_id_fkey(username, display_name, avatar_url)", { count: "exact" })
        .eq("published", true)
        .order("published_at", { ascending: false })
        .range(from, to)
        .abortSignal(timeout.signal);

      if (error) return { posts: [], total: 0, page, pageSize };

      const posts = (data as unknown as PostQueryRow[]).map(flattenPostTags);

      return {
        posts,
        total: count ?? 0,
        page,
        pageSize,
      };
    } catch {
      return { posts: [], total: 0, page, pageSize };
    } finally {
      timeout.clear();
    }
  }
);

export const getPostBySlug = cache(async (slug: string) => {
  const timeout = withTimeoutSignal();
  try {
    const { data, error } = await publicSupabase
      .from("posts")
      .select("*, categories(*), tags:post_tags(tag:tags(*)), profiles!posts_author_id_fkey(username, display_name, avatar_url)")
      .eq("slug", slug)
      .eq("published", true)
      .abortSignal(timeout.signal)
      .single();

    if (error) throw error;
    return flattenPostTags(data) as unknown as Post;
  } finally {
    timeout.clear();
  }
});

export async function getAllPosts(page = 1, pageSize = 20) {
  try {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from("posts")
      .select("*, categories(*), tags:post_tags(tag:tags(*)), profiles!posts_author_id_fkey(username, display_name, avatar_url)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return { posts: [], total: 0, page, pageSize };

    const posts = (data as unknown as PostQueryRow[]).map(flattenPostTags);

    return {
      posts,
      total: count ?? 0,
      page,
      pageSize,
    };
  } catch {
    return { posts: [], total: 0, page, pageSize };
  }
}

export const getPostsByTag = cache(
  async (tagSlug: string, page = 1, pageSize = 10) => {
    const timeout = withTimeoutSignal();
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await publicSupabase
        .from("posts")
        .select("*, categories(*), tags:post_tags!inner(tag:tags!inner(*)), profiles!posts_author_id_fkey(username, display_name, avatar_url)", { count: "exact" })
        .eq("published", true)
        .eq("tags.slug", tagSlug)
        .order("published_at", { ascending: false })
        .range(from, to)
        .abortSignal(timeout.signal);

      if (error) return { posts: [], total: 0, page, pageSize };

      const posts = (data as unknown as PostQueryRow[]).map(flattenPostTags);

      return {
        posts,
        total: count ?? 0,
        page,
        pageSize,
      };
    } catch {
      return { posts: [], total: 0, page, pageSize };
    } finally {
      timeout.clear();
    }
  }
);

export const getPostsByCategory = cache(
  async (categorySlug: string, page = 1, pageSize = 10) => {
    const timeout = withTimeoutSignal();
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await publicSupabase
        .from("posts")
        .select("*, categories!inner(*), tags:post_tags(tag:tags(*)), profiles!posts_author_id_fkey(username, display_name, avatar_url)", { count: "exact" })
        .eq("published", true)
        .eq("categories.slug", categorySlug)
        .order("published_at", { ascending: false })
        .range(from, to)
        .abortSignal(timeout.signal);

      if (error) return { posts: [], total: 0, page, pageSize };

      const posts = (data as unknown as PostQueryRow[]).map(flattenPostTags);

      return {
        posts,
        total: count ?? 0,
        page,
        pageSize,
      };
    } catch {
      return { posts: [], total: 0, page, pageSize };
    } finally {
      timeout.clear();
    }
  }
);

export const getRecentPosts = cache(
  async (limit = 5) => {
    const timeout = withTimeoutSignal();
    try {
      const { data, error } = await publicSupabase
        .from("posts")
        .select("id, slug, title, excerpt, published_at, reading_time, cover_image, categories(id, name, slug)")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(limit)
        .abortSignal(timeout.signal);

      if (error) return [];
      return data as unknown as Pick<Post, "id" | "slug" | "title" | "excerpt" | "published_at" | "reading_time" | "cover_image" | "categories">[];
    } catch {
      return [];
    } finally {
      timeout.clear();
    }
  }
);
