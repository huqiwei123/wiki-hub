import { publicSupabase, withTimeoutSignal } from "@/lib/supabase/public";
import { cache } from "react";

export interface PostLinkEdge {
  source: string;
  target: string;
  sourceTitle: string;
  targetTitle: string;
}

type LinkedPost = { slug: string; title: string } | null;
type PostLinkRow = {
  source: LinkedPost;
  target: LinkedPost;
  target_slug: string;
};
type BacklinkRow = {
  source: LinkedPost;
};
type ForwardLinkRow = {
  target: LinkedPost;
  target_slug: string;
};
type GraphPostRow = {
  slug: string;
  title: string;
  categories: { name: string } | null;
};
type GraphLinkRow = {
  source: { slug: string } | null;
  target: { slug: string } | null;
  target_slug: string;
};

export async function getPostLinks(slug: string): Promise<PostLinkEdge[]> {
  const timeout = withTimeoutSignal();
  try {
    // Get post ID first
    const { data: post } = await publicSupabase
      .from("posts")
      .select("id, title, slug")
      .eq("slug", slug)
      .eq("published", true)
      .abortSignal(timeout.signal)
      .maybeSingle();

    if (!post) return [];

    // Get links where this post is source or target
    const { data: links, error } = await publicSupabase
      .from("post_links")
      .select("source_post_id, target_post_id, target_slug, source:source_post_id(slug, title), target:target_post_id(slug, title)")
      .or(`source_post_id.eq.${post.id},target_post_id.eq.${post.id}`)
      .abortSignal(timeout.signal);

    if (error || !links) return [];

    return (links as unknown as PostLinkRow[]).map((l) => ({
      source: l.source?.slug ?? "",
      target: l.target?.slug ?? l.target_slug,
      sourceTitle: l.source?.title ?? "",
      targetTitle: l.target?.title ?? l.target_slug,
    }));
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
}

export const getBacklinks = cache(async (postId: string): Promise<Array<{ slug: string; title: string }>> => {
  const timeout = withTimeoutSignal();
  try {
    const { data: links, error } = await publicSupabase
      .from("post_links")
      .select("source:source_post_id(slug, title)")
      .eq("target_post_id", postId)
      .abortSignal(timeout.signal);

    if (error || !links) return [];

    return (links as unknown as BacklinkRow[])
      .filter((l): l is BacklinkRow & { source: NonNullable<BacklinkRow["source"]> } => Boolean(l.source))
      .map((l) => ({ slug: l.source.slug, title: l.source.title }));
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
});

export const getForwardLinks = cache(async (postId: string): Promise<Array<{ slug: string; title: string }>> => {
  const timeout = withTimeoutSignal();
  try {
    const { data: links, error } = await publicSupabase
      .from("post_links")
      .select("target:target_post_id(slug, title), target_slug")
      .eq("source_post_id", postId)
      .abortSignal(timeout.signal);

    if (error || !links) return [];

    return (links as unknown as ForwardLinkRow[]).map((l) => ({
      slug: l.target?.slug ?? l.target_slug,
      title: l.target?.title ?? l.target_slug,
    }));
  } catch {
    return [];
  } finally {
    timeout.clear();
  }
});

export async function getAllGraphData() {
  const timeout = withTimeoutSignal();
  try {
    const [{ data: posts }, { data: links }] = await Promise.all([
      publicSupabase
        .from("posts")
        .select("slug, title, categories(name)")
        .eq("published", true)
        .abortSignal(timeout.signal),
      publicSupabase
        .from("post_links")
        .select("source:source_post_id(slug), target:target_post_id(slug), target_slug")
        .abortSignal(timeout.signal),
    ]);

    const nodes = ((posts ?? []) as unknown as GraphPostRow[]).map((p) => ({
      id: p.slug,
      label: p.title,
      group: p.categories?.name ?? "Uncategorized",
    }));

    const edges = ((links ?? []) as unknown as GraphLinkRow[]).map((l) => ({
      source: l.source?.slug ?? "",
      target: l.target?.slug ?? l.target_slug,
    }));

    return { nodes, edges };
  } catch {
    return { nodes: [], edges: [] };
  } finally {
    timeout.clear();
  }
}
