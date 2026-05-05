export const siteConfig = {
  name: "WikiHub",
  description: "A personal knowledge base and blogging platform",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  author: {
    name: "Author",
    email: "author@example.com",
  },
  nav: [
    { label: "Articles", href: "/blog" },
    { label: "Categories", href: "/categories" },
    // { label: "Knowledge Graph", href: "/graph" },
    { label: "Bookmarks", href: "/bookmarks" },
    { label: "About", href: "/about" },
  ],
} as const;
