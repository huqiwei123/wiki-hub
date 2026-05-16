import type { MetadataRoute } from "next";
import { query } from "@/lib/db/query";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await query<{ slug: string; updated_at: string }>(
    `
    SELECT slug, updated_at
    FROM posts
    WHERE published = true
    ORDER BY published_at DESC NULLS LAST
    `,
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const postEntries: MetadataRoute.Sitemap =
    posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...postEntries,
  ];
}
