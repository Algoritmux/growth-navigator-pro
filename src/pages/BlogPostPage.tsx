import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { getPostBySlug } from "@/lib/blogStore";
import SEO from "@/components/SEO";
import { contentToHtml, extractFirstImageSrc } from "@/lib/markdown";
import authorAvatar from "@/assets/guilherme-about-new.jpg";
import { ArrowRight, Facebook, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

const POST_FONT_MAP = {
  theme: "inherit",
  arial: "Arial, Helvetica, sans-serif",
  georgia: "Georgia, serif",
  times: "'Times New Roman', Times, serif",
} as const;

const DEFAULT_POST_EDITOR_SETTINGS = {
  font: "theme" as const,
  fontSize: 18,
  lineHeight: 1.15,
  paragraphSpaceBefore: 8,
  paragraphSpaceAfter: 12,
};

function formatDisplayDate(dateISO: string) {
  const date = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateISO;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = slug ? getPostBySlug(slug) : undefined;

  const articleRef = useRef<HTMLElement | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeHeading, setActiveHeading] = useState("");
  const [readProgress, setReadProgress] = useState(0);
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const coverImage = useMemo(() => extractFirstImageSrc(post?.content ?? ""), [post?.content]);
  const articleHtml = useMemo(() => {
    const html = contentToHtml(post?.content ?? "");
    return html.replace(/<p>\s*<img[^>]*>\s*<\/p>/i, "").replace(/<img[^>]*>/i, "");
  }, [post?.content]);
  const shareLinks = useMemo(() => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(post?.title ?? "");

    return {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    };
  }, [post?.title]);

  const postEditorSettings = {
    font: post?.editorSettings?.font ?? DEFAULT_POST_EDITOR_SETTINGS.font,
    fontSize: post?.editorSettings?.fontSize ?? DEFAULT_POST_EDITOR_SETTINGS.fontSize,
    lineHeight: post?.editorSettings?.lineHeight ?? DEFAULT_POST_EDITOR_SETTINGS.lineHeight,
    paragraphSpaceBefore: post?.editorSettings?.paragraphSpaceBefore ?? DEFAULT_POST_EDITOR_SETTINGS.paragraphSpaceBefore,
    paragraphSpaceAfter: post?.editorSettings?.paragraphSpaceAfter ?? DEFAULT_POST_EDITOR_SETTINGS.paragraphSpaceAfter,
  };

  const articleStyle: CSSProperties & Record<string, string | number> = {
    fontFamily: POST_FONT_MAP[postEditorSettings.font],
    fontSize: `${postEditorSettings.fontSize}px`,
    lineHeight: postEditorSettings.lineHeight,
    "--post-p-before": `${postEditorSettings.paragraphSpaceBefore}px`,
    "--post-p-after": `${postEditorSettings.paragraphSpaceAfter}px`,
  };

  const articleClassName = [
    "prose prose-sm sm:prose-base max-w-none",
    "prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary",
    "prose-li:text-foreground/90 prose-blockquote:text-muted-foreground",
    "[&_p]:text-foreground/90",
    "[&_p]:[margin-top:var(--post-p-before)] [&_p]:[margin-bottom:var(--post-p-after)]",
    "prose-img:rounded-md prose-img:shadow-sm",
  ].join(" ");

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const headingNodes = Array.from(article.querySelectorAll("h2, h3")) as HTMLElement[];
    const items: TocItem[] = headingNodes.map((node, index) => {
      const raw = node.textContent?.trim() || `secao-${index + 1}`;
      const id = node.id || `${slugify(raw)}-${index + 1}`;
      node.id = id;
      return {
        id,
        text: raw,
        level: Number(node.tagName.replace("H", "")) || 2,
      };
    });

    setToc(items);
    setActiveHeading(items[0]?.id ?? "");

    const updateReadingState = () => {
      const target = articleRef.current;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const totalDistance = rect.height + viewport;
      const passed = viewport - rect.top;
      const progress = Math.min(100, Math.max(0, (passed / totalDistance) * 100));
      setReadProgress(progress);

      if (!items.length) return;

      let current = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 180) {
          current = item.id;
        }
      }
      setActiveHeading(current);
    };

    updateReadingState();
    window.addEventListener("scroll", updateReadingState, { passive: true });
    window.addEventListener("resize", updateReadingState);

    return () => {
      window.removeEventListener("scroll", updateReadingState);
      window.removeEventListener("resize", updateReadingState);
    };
  }, [articleHtml]);

  if (!post || !post.published) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto w-full max-w-3xl px-5 py-10">
          <Link to="/blog" className="text-sm text-muted-foreground hover:underline">
            &larr; Voltar para o blog
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Post nao encontrado</h1>
        </section>
      </main>
    );
  }

  const displayDate = formatDisplayDate(post.dateISO);

  function handleTocClick(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleNewsletterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newsletterName.trim() || !newsletterEmail.trim()) return;
    window.open("https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7281675119909912577", "_blank");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEO
        title={post.title}
        description={post.excerpt}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          author: {
            "@type": "Person",
            name: "Guilherme Correia",
          },
          datePublished: post.dateISO,
          dateModified: post.updatedAtISO || post.dateISO,
          articleSection: post.category,
          keywords: post.tags.join(", "),
        }}
      />

      <section className="mx-auto w-full max-w-[1360px] px-5 py-10">
        <Link to="/blog" className="text-sm text-muted-foreground hover:underline">
          &larr; Voltar para o blog
        </Link>

        <header className="mx-auto mt-6 max-w-6xl text-center">
          <h1 className="text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl">
            {post.title}
          </h1>

          <time dateTime={post.dateISO} className="mt-5 block text-xl font-semibold text-foreground md:text-2xl">
            {displayDate}
          </time>

          <div className="mt-6 flex flex-col items-center">
            <img
              src={authorAvatar}
              alt="Guilherme Correia"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-border md:h-20 md:w-20"
            />
            <div className="mt-3 text-2xl font-medium text-foreground">Guilherme Correia</div>
            <div className="mt-1 text-sm text-muted-foreground md:text-base">
              Estrategia de growth, dados e IA aplicada a negocios
            </div>
          </div>
        </header>

        {coverImage && (
          <div className="mt-7 overflow-hidden bg-card">
            <img src={coverImage} alt={post.title} className="h-[180px] w-full object-cover md:h-[250px] lg:h-[320px]" />
          </div>
        )}

        <div className="mt-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:gap-8">
          <aside className="hidden lg:row-span-2 lg:block">
            <div className="sticky top-24">
              <h3 className="text-2xl font-medium leading-tight text-foreground md:text-3xl">Navegue pelo guia</h3>
              <div className="mt-6 h-2 w-full rounded-full bg-border">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${Math.max(6, readProgress)}%` }}
                />
              </div>

              <div className="mt-5 text-xl font-medium text-primary">Ir para:</div>
              <div className="mt-4 max-h-[62vh] overflow-auto pr-2">
                {toc.length > 0 ? (
                  <ul className="space-y-3">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleTocClick(item.id)}
                          className={[
                            "w-full text-left text-base leading-snug transition-colors",
                            item.level === 3 ? "pl-4" : "",
                            activeHeading === item.id ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
                          ].join(" ")}
                        >
                          {item.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Adicione subtitulos (H2/H3) no post para criar o indice automatico.</p>
                )}
              </div>
            </div>
          </aside>

          <div className="min-w-0 lg:col-start-2">
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>

            <article
              ref={articleRef}
              className={articleClassName}
              style={articleStyle}
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
          </div>

          <aside className="mt-10 lg:col-start-3 lg:mt-0">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border bg-secondary/50 p-5 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>

                <div className="mt-4 text-balance text-xl font-semibold leading-snug text-foreground md:text-2xl">
                  Insights semanais sobre crescimento previsivel
                </div>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Receba artigos estrategicos sobre marketing, vendas e dados direto da pratica, sem teoria generica.
                </p>

              <form onSubmit={handleNewsletterSubmit} className="mt-5 space-y-2.5">
                <input
                  type="text"
                  required
                  value={newsletterName}
                  onChange={(e) => setNewsletterName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-11 w-full rounded-lg border bg-background px-3 text-base outline-none"
                />
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="h-11 w-full rounded-lg border bg-background px-3 text-base outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Receber
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Sem spam. Cancele quando quiser.</p>
              </div>

              <div className="rounded-2xl border bg-card p-5 text-center">
                <div className="text-2xl font-medium leading-tight text-foreground">Gostou? Compartilhe:</div>
                <div className="mt-3 flex items-center justify-center gap-2.5">
                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Compartilhar no WhatsApp"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Compartilhar no Facebook"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Compartilhar no LinkedIn"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Compartilhar no X"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-5 flex flex-col items-center">
                  <img
                    src={authorAvatar}
                    alt="Guilherme Correia"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
                  />
                  <div className="mt-2.5 text-xl font-medium text-foreground">Guilherme Correia</div>
                  <div className="mt-1 text-sm leading-snug text-muted-foreground">
                    Estrategia de growth, dados e IA aplicada a negocios
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
