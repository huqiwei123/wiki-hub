import {
  BrainCircuit,
  CloudCog,
  Code2,
  DatabaseZap,
  Layers3,
  Palette,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_STYLES = [
  { bg: "#2563eb18", text: "#2563eb", icon: Code2 },
  { bg: "#05966918", text: "#059669", icon: CloudCog },
  { bg: "#7c3aed18", text: "#7c3aed", icon: Layers3 },
  { bg: "#d9770618", text: "#d97706", icon: BrainCircuit },
  { bg: "#db277718", text: "#db2777", icon: Palette },
  { bg: "#0284c718", text: "#0284c7", icon: DatabaseZap },
] as const;

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  ai: BrainCircuit,
  artificial: BrainCircuit,
  development: Code2,
  frontend: Layers3,
  infrastructure: CloudCog,
  database: DatabaseZap,
  design: Palette,
};

export function getCategoryStyle(slug: string, index = 0) {
  const fallback = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
  return {
    ...fallback,
    icon: CATEGORY_ICON_MAP[slug] ?? fallback.icon,
  };
}
