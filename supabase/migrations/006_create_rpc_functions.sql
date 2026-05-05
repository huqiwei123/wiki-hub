-- 006: RPC functions for search and view tracking

-- Full-text search function
CREATE OR REPLACE FUNCTION public.search_posts(
  search_query TEXT,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  excerpt TEXT,
  category_id UUID,
  author_id UUID,
  cover_image TEXT,
  reading_time INT,
  view_count INT,
  published_at TIMESTAMPTZ,
  rank REAL
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.slug,
    p.title,
    p.excerpt,
    p.category_id,
    p.author_id,
    p.cover_image,
    p.reading_time,
    p.view_count,
    p.published_at,
    ts_rank(p.fts, plainto_tsquery('simple', search_query)) AS rank
  FROM public.posts p
  WHERE p.published = true
    AND p.fts @@ plainto_tsquery('simple', search_query)
  ORDER BY rank DESC, p.published_at DESC
  LIMIT limit_count;
END;
$$;

-- Atomic view count increment
CREATE OR REPLACE FUNCTION public.increment_post_view(post_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$;
