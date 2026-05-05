-- 004: Post links (bidirectional links for knowledge graph)
CREATE TABLE public.post_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  target_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  target_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post links are viewable by everyone"
  ON public.post_links FOR SELECT USING (true);

CREATE POLICY "Admins can manage post links"
  ON public.post_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX idx_post_links_source ON public.post_links (source_post_id);
CREATE INDEX idx_post_links_target ON public.post_links (target_post_id);
