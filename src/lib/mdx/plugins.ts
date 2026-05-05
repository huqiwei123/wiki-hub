import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";
import type { PluggableList } from "unified";
import { remarkWikiLinks } from "./remark-wiki-links";

export const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
  keepBackground: false,
  defaultLang: "plaintext",
};

export function getRemarkPlugins(): PluggableList {
  return [remarkGfm, remarkWikiLinks];
}

export function getRehypePlugins(): PluggableList {
  return [[rehypePrettyCode, rehypePrettyCodeOptions]];
}
