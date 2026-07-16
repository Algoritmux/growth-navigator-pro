import { useMemo, type CSSProperties } from "react";
import { contentToHtml } from "@/lib/markdown";

type BlogContentRendererProps = {
  content: string;
  className?: string;
  style?: CSSProperties & Record<string, string | number>;
  stripLeadingImage?: boolean;
};

export const BLOG_CONTENT_CLASS_NAME = [
  "blog-content prose prose-base sm:prose-lg max-w-none",
  "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
  "prose-h1:text-3xl sm:prose-h1:text-4xl",
  "prose-h2:mt-12 prose-h2:border-t prose-h2:pt-8 prose-h2:text-2xl sm:prose-h2:mt-14 sm:prose-h2:pt-10 sm:prose-h2:text-3xl",
  "prose-h3:mt-8 prose-h3:text-xl sm:prose-h3:mt-9 sm:prose-h3:text-2xl",
  "prose-strong:text-foreground prose-a:font-semibold prose-a:text-primary",
  "prose-li:text-foreground/90 prose-blockquote:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/40 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:text-muted-foreground sm:prose-blockquote:px-5",
  "[&_p]:text-foreground/90",
  "[&_p]:[margin-top:var(--post-p-before,var(--preview-p-before,0.75rem))] [&_p]:[margin-bottom:var(--post-p-after,var(--preview-p-after,1rem))]",
  "prose-ul:space-y-2 prose-ol:space-y-2",
  "prose-hr:my-10 prose-hr:border-border",
  "prose-img:mx-auto prose-img:my-8 prose-img:block prose-img:h-auto prose-img:max-w-full prose-img:rounded-xl prose-img:border prose-img:object-contain prose-img:shadow-sm sm:prose-img:rounded-2xl",
].join(" ");

export default function BlogContentRenderer({
  content,
  className,
  style,
  stripLeadingImage = false,
}: BlogContentRendererProps) {
  const html = useMemo(() => {
    const rendered = contentToHtml(content);
    if (!stripLeadingImage) return rendered;

    return rendered
      .replace(/^\s*<p>\s*<img[^>]*>\s*<\/p>/i, "")
      .replace(/^\s*<img[^>]*>/i, "");
  }, [content, stripLeadingImage]);

  return (
    <div
      className={[BLOG_CONTENT_CLASS_NAME, className].filter(Boolean).join(" ")}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
