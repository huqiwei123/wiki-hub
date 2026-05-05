import type { Plugin } from "unified";
import type { Link, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

// Matches [[slug]] and [[slug|display text]]
const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function extractWikiLinks(content: string): Array<{ slug: string; display: string }> {
  const links: Array<{ slug: string; display: string }> = [];
  for (const match of content.matchAll(WIKI_LINK_RE)) {
    const slug = match[1].trim();
    const display = (match[2] || slug).trim();
    links.push({ slug, display });
  }
  return links;
}

// Remark plugin that transforms [[wiki links]] into <a> elements
export const remarkWikiLinks: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index === undefined) return;

      const matches = [...node.value.matchAll(WIKI_LINK_RE)];
      if (matches.length === 0) return;

      const children: Array<Link | Text> = [];
      let lastIndex = 0;

      for (const match of matches) {
        const slug = match[1].trim();
        const display = (match[2] || slug).trim();
        const offset = match.index!;

        if (offset > lastIndex) {
          children.push({ type: "text", value: node.value.slice(lastIndex, offset) });
        }

        children.push({
          type: "link",
          url: `/blog/${slug}`,
          title: `Wikilink to ${slug}`,
          data: { hProperties: { className: "wiki-link" } },
          children: [{ type: "text", value: display }],
        });

        lastIndex = offset + match[0].length;
      }

      if (lastIndex < node.value.length) {
        children.push({ type: "text", value: node.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
    });
  };
};
