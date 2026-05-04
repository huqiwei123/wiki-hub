import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";
import type { PluggableList } from "unified";

export const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
  keepBackground: false,
  defaultLang: "plaintext",
};

export function getRemarkPlugins(): PluggableList {
  return [remarkGfm];
}

export function getRehypePlugins(): PluggableList {
  return [[rehypePrettyCode, rehypePrettyCodeOptions]];
}
