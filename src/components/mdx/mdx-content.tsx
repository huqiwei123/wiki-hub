import { MDXRemote } from "next-mdx-remote/rsc";
import { getRemarkPlugins, getRehypePlugins } from "@/lib/mdx/plugins";

const components = {
  // Custom MDX components can be added here
  // e.g., Callout, ImageCard, etc.
};

type MdxContentProps = {
  source: string;
};

export function MdxContent({ source }: MdxContentProps) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-28 prose-headings:font-semibold prose-h2:text-3xl prose-h3:text-2xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-p:leading-8 prose-li:leading-7 prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-2xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/80 prose-img:rounded-2xl">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: getRemarkPlugins(),
            rehypePlugins: getRehypePlugins(),
          },
        }}
      />
    </div>
  );
}
