export const articles = [
  {
    title: "Deep Dive into TypeScript 5.0 Decorators",
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
  { name: "Development", count: 32, color: "#2563eb", bg: "#eff6ff", tags: ["TypeScript", "Python", "Rust", "Go"] },
  { name: "Infrastructure", count: 24, color: "#059669", bg: "#ecfdf5", tags: ["AWS", "Docker", "Kubernetes", "PostgreSQL"] },
  { name: "Frontend Development", count: 28, color: "#dc2626", bg: "#fef2f2", tags: ["React", "Next.js", "CSS", "Accessibility"] },
  { name: "Artificial Intelligence", count: 15, color: "#f97316", bg: "#fff7ed", tags: ["LLM", "LangChain", "PyTorch", "Prompt Engineering"] },
  { name: "Security", count: 18, color: "#7c3aed", bg: "#faf5ff", tags: ["Cybersecurity", "Encryption", "OWASP", "Privacy"] },
  { name: "Mobile Development", count: 10, color: "#16a34a", bg: "#f0fdf4", tags: ["iOS", "Android", "Flutter", "React Native"] },
];

export const tags = [
  ["TypeScript", 48, "#2563eb", "#eff6ff"],
  ["React", 41, "#059669", "#ecfdf5"],
  ["Next.js", 36, "#dc2626", "#fef2f2"],
  ["LLM", 29, "#f97316", "#fff7ed"],
  ["PostgreSQL", 23, "#7c3aed", "#faf5ff"],
  ["Python", 31, "#16a34a", "#f0fdf4"],
  ["AWS", 19, "#ca8a04", "#fefce8"],
  ["Docker", 18, "#0891b2", "#ecfeff"],
  ["Kubernetes", 15, "#c026d3", "#fdf2f8"],
  ["Rust", 12, "#475569", "#f8fafc"],
  ["Vue", 11, "#0369a1", "#f0f9ff"],
  ["CSS", 20, "#e11d48", "#fff1f2"],
  ["LangChain", 8, "#111827", "#f1f5f9"],
  ["Go", 10, "#111827", "#f1f5f9"],
  ["Prompt Engineering", 9, "#111827", "#f1f5f9"],
  ["Flutter", 6, "#111827", "#f1f5f9"],
] as const;

export const graphStats = [
  { label: "Total Articles", value: 142, color: "#2563eb" },
  { label: "Total Connections", value: 256, color: "#059669" },
  { label: "Orphan Articles", value: 12, color: "#dc2626" },
];
