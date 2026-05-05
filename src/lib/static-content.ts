export const articles = [
  {
    title: "Deep Dive into TypeScript 5.0 Decorators",
    slug: "deep-dive",
    excerpt: "Learn how the new ECMAScript decorators standard transforms TypeScript application architecture.",
    category: "TypeScript",
    date: "Mar 12, 2026",
    read: "8 min read",
    gradient: "from-indigo-500 to-violet-500",
    icon: "code",
    image: "/generated/typescript-decorators.png",
  },
  {
    title: "Building Scalable APIs with PostgreSQL and Supabase",
    slug: "scalable-apis",
    excerpt: "A practical guide to schema design, row level security, and production-ready API patterns.",
    category: "Backend",
    date: "Mar 10, 2026",
    read: "12 min read",
    gradient: "from-emerald-500 to-teal-500",
    icon: "database",
    image: "/generated/backend-supabase.png",
  },
  {
    title: "Server Components: The Complete Mental Model",
    slug: "server-components",
    excerpt: "Understand how React Server Components reshape routing, data loading, and rendering.",
    category: "React",
    date: "Mar 8, 2026",
    read: "6 min read",
    gradient: "from-orange-500 to-red-500",
    icon: "component",
    image: "/generated/react-server-components.png",
  },
];

export const categories = [
  { name: "Development", count: 32, color: "#2563eb", bg: "#2563eb18", tags: ["TypeScript", "Python", "Rust", "Go"] },
  { name: "Infrastructure", count: 24, color: "#059669", bg: "#05966918", tags: ["AWS", "Docker", "Kubernetes", "PostgreSQL"] },
  { name: "Frontend Development", count: 28, color: "#dc2626", bg: "#dc262618", tags: ["React", "Next.js", "CSS", "Accessibility"] },
  { name: "Artificial Intelligence", count: 15, color: "#f97316", bg: "#f9731618", tags: ["LLM", "LangChain", "PyTorch", "Prompt Engineering"] },
  { name: "Security", count: 18, color: "#7c3aed", bg: "#7c3aed18", tags: ["Cybersecurity", "Encryption", "OWASP", "Privacy"] },
  { name: "Mobile Development", count: 10, color: "#16a34a", bg: "#16a34a18", tags: ["iOS", "Android", "Flutter", "React Native"] },
];

export const tags = [
  ["TypeScript", 48, "#2563eb", "#2563eb18"],
  ["React", 41, "#059669", "#05966918"],
  ["Next.js", 36, "#dc2626", "#dc262618"],
  ["LLM", 29, "#f97316", "#f9731618"],
  ["PostgreSQL", 23, "#7c3aed", "#7c3aed18"],
  ["Python", 31, "#16a34a", "#16a34a18"],
  ["AWS", 19, "#ca8a04", "#ca8a0418"],
  ["Docker", 18, "#0891b2", "#0891b218"],
  ["Kubernetes", 15, "#c026d3", "#c026d318"],
  ["Rust", 12, "#ea580c", "#ea580c18"],
  ["Vue", 11, "#0369a1", "#0369a118"],
  ["CSS", 20, "#e11d48", "#e11d4818"],
  ["LangChain", 8, "#6366f1", "#6366f118"],
  ["Go", 10, "#06b6d4", "#06b6d418"],
  ["Prompt Engineering", 9, "#f59e0b", "#f59e0b18"],
  ["Flutter", 6, "#8b5cf6", "#8b5cf618"],
] as const;

export const graphStats = [
  { label: "Total Articles", value: 142, color: "#2563eb" },
  { label: "Total Connections", value: 256, color: "#059669" },
  { label: "Orphan Articles", value: 12, color: "#dc2626" },
];
