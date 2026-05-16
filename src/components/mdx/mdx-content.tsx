import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { getRemarkPlugins, getRehypePlugins } from "@/lib/mdx/plugins";
import type { Pluggable } from "unified";

type MdxContentProps = {
  source: string;
};

function applyPlugins(pipeline: ReturnType<typeof unified>, plugins: Pluggable[]) {
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) {
      const [fn, ...opts] = plugin;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pipeline.use(fn as any, ...opts);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pipeline.use(plugin as any);
    }
  }
  return pipeline;
}

export async function MdxContent({ source }: MdxContentProps) {
  const pipeline = unified().use(remarkParse);
  applyPlugins(pipeline as unknown as ReturnType<typeof unified>, getRemarkPlugins());
  pipeline.use(remarkRehype, { allowDangerousHtml: true });
  applyPlugins(pipeline as unknown as ReturnType<typeof unified>, getRehypePlugins());
  pipeline.use(rehypeStringify, { allowDangerousHtml: true });

  const result = await pipeline.process(source);

  return (
    <div
      className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-28 prose-headings:font-semibold prose-h2:text-3xl prose-h3:text-2xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-p:leading-8 prose-li:leading-7 prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-2xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/80 prose-img:rounded-2xl"
      dangerouslySetInnerHTML={{ __html: String(result) }}
    />
  );
}
