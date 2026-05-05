export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: "admin" | "reader";
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  category_id: string | null;
  author_id: string;
  cover_image: string | null;
  reading_time: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  categories: Category | null;
  tags: Tag[];
  profiles: Profile | null;
};

export type PostLink = {
  id: string;
  source_post_id: string;
  target_post_id: string | null;
  target_slug: string;
  created_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  content: string;
  parent_id: string | null;
  is_approved: boolean;
  created_at: string;
  profiles: Profile | null;
  replies?: Comment[];
};

export type Bookmark = {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  posts: Post;
};

export type Like = {
  id: string;
  user_id: string;
  target_type: "post" | "comment";
  target_id: string;
  created_at: string;
};

export type Subscription = {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
};
