import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPostBySlugFromApi, type BlogPost } from "@/lib/blogStore";
import SEO from "@/components/SEO";
import BlogContentRenderer from "@/components/blog/BlogContentRenderer";
import { resolveBlogMediaUrl } from "@/lib/blogMedia";
import { isPubliclyVisibleBlogPost } from "@/lib/blogSchedule";
import { contentToHtml, extractCoverImageSrc, extractFirstImageSrc } from "@/lib/markdown";
import authorAvatar from "@/assets/guilherme-about-new.jpeg";
import {
  ArrowRight,
  BookOpen,
  Link2,
  Linkedin,
  Mail,
  Share2,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/lib/leadsApi";

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

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 0 0-8.76 14.81L2 22l5.32-1.2A10 10 0 1 0 12 2Zm5.86 14.23c-.24.68-1.4 1.3-1.95 1.34-.5.04-1.13.06-1.83-.16a16.06 16.06 0 0 1-5.98-3.73 12.97 12.97 0 0 1-2.4-3.2c-.51-.93-.52-1.78-.02-2.52.23-.34.5-.52.78-.52h.56c.18 0 .42-.07.66.5.24.57.82 1.97.9 2.11.07.14.12.3.02.48-.1.18-.15.3-.3.47-.14.17-.3.38-.43.5-.14.14-.28.3-.12.58.17.29.74 1.22 1.58 1.97 1.1.98 2.03 1.29 2.32 1.43.29.14.46.12.62-.07.16-.19.7-.82.89-1.1.19-.29.38-.24.65-.14.27.1 1.68.8 1.97.95.29.14.48.21.55.33.07.12.07.72-.17 1.4Z" />
    </svg>
  );
}

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

  const articleRef = useRef<HTMLElement | null>(null);
  const [post, setPost] = useState<BlogPost | undefined>();
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeHeading, setActiveHeading] = useState("");
  const [readProgress, setReadProgress] = useState(0);
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  const coverImage = useMemo(
    () => {
      const src =
      post?.coverImage ||
      extractCoverImageSrc(post?.content ?? "") ||
      extractFirstImageSrc(post?.content ?? "");
      return src ? resolveBlogMediaUrl(src) : undefined;
    },
    [post?.coverImage, post?.content],
  );
  const articleHtml = useMemo(() => {
    const html = contentToHtml(post?.content ?? "");
    return html
      .replace(/^\s*<p>\s*<img[^>]*>\s*<\/p>/i, "")
      .replace(/^\s*<img[^>]*>/i, "");
  }, [post?.content]);
  const shareLinks = useMemo(() => {
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(post?.title ?? "");

    return {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    };
  }, [post?.title]);

  const postEditorSettings = {
    font: post?.editorSettings?.font ?? DEFAULT_POST_EDITOR_SETTINGS.font,
    fontSize:
      post?.editorSettings?.fontSize ?? DEFAULT_POST_EDITOR_SETTINGS.fontSize,
    lineHeight:
      post?.editorSettings?.lineHeight ??
      DEFAULT_POST_EDITOR_SETTINGS.lineHeight,
    paragraphSpaceBefore:
      post?.editorSettings?.paragraphSpaceBefore ??
      DEFAULT_POST_EDITOR_SETTINGS.paragraphSpaceBefore,
    paragraphSpaceAfter:
      post?.editorSettings?.paragraphSpaceAfter ??
      DEFAULT_POST_EDITOR_SETTINGS.paragraphSpaceAfter,
  };

  const articleStyle: CSSProperties & Record<string, string | number> = {
    fontFamily: POST_FONT_MAP[postEditorSettings.font],
    fontSize: `${postEditorSettings.fontSize}px`,
    lineHeight: postEditorSettings.lineHeight,
    "--post-p-before": `${postEditorSettings.paragraphSpaceBefore}px`,
    "--post-p-after": `${postEditorSettings.paragraphSpaceAfter}px`,
  };

  useEffect(() => {
    let active = true;

    if (!slug) {
      setIsLoadingPost(false);
      return;
    }

    setIsLoadingPost(true);
    fetchPostBySlugFromApi(slug)
      .then((data) => {
        if (active) setPost(data);
      })
      .catch((error) => {
        console.error(error);
        if (active) setPost(undefined);
      })
      .finally(() => {
        if (active) setIsLoadingPost(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const headingNodes = Array.from(
      article.querySelectorAll("h2, h3"),
    ) as HTMLElement[];
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
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const articleTop = scrollTop + rect.top;
      const articleBottom = scrollTop + rect.bottom;
      const articleDistance = Math.max(1, articleBottom - articleTop - viewport);
      const hasReachedArticleEnd = scrollTop + viewport >= articleBottom - 8;
      const hasReachedPageEnd =
        scrollTop + viewport >= document.documentElement.scrollHeight - 8;
      const progress =
        hasReachedArticleEnd || hasReachedPageEnd
          ? 100
          : Math.min(
              100,
              Math.max(0, ((scrollTop - articleTop) / articleDistance) * 100),
            );
      setReadProgress(progress);

      if (!items.length) return;

      const isNearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 160;

      if (isNearBottom) {
        setActiveHeading(items[items.length - 1].id);
        return;
      }

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
    window.addEventListener("load", updateReadingState);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateReadingState)
        : undefined;
    resizeObserver?.observe(article);

    const images = Array.from(article.querySelectorAll("img"));
    images.forEach((image) =>
      image.addEventListener("load", updateReadingState),
    );

    return () => {
      window.removeEventListener("scroll", updateReadingState);
      window.removeEventListener("resize", updateReadingState);
      window.removeEventListener("load", updateReadingState);
      resizeObserver?.disconnect();
      images.forEach((image) =>
        image.removeEventListener("load", updateReadingState),
      );
    };
  }, [articleHtml]);

  if (isLoadingPost) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto w-full max-w-3xl px-5 py-10">
          <Link
            to="/blog"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Voltar para o blog
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Carregando post...</h1>
        </section>
      </main>
    );
  }

  if (!post || !isPubliclyVisibleBlogPost(post)) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto w-full max-w-3xl px-5 py-10">
          <Link
            to="/blog"
            className="text-sm text-muted-foreground hover:underline"
          >
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

  async function handleNewsletterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newsletterName.trim() || !newsletterEmail.trim()) return;

    setIsSubmittingNewsletter(true);

    try {
      await subscribeToNewsletter({
        name: newsletterName,
        email: newsletterEmail,
        source: "blog-post-sidebar",
      });

      toast.success("Inscrição realizada!", {
        description: "Obrigado! Sua inscrição foi realizada com sucesso.",
      });

      setNewsletterName("");
      setNewsletterEmail("");
    } catch (error) {
      toast.error("Não foi possível salvar sua inscrição.", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsSubmittingNewsletter(false);
    }
  }

  async function copyCurrentLink(message = "Link copiado!") {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    toast.success(message);
  }

  async function handleNativeShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyCurrentLink("Link copiado para compartilhar.");
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

      <section className="mx-auto w-full max-w-[1360px] px-4 py-8 sm:px-5 sm:py-10">
        <Link
          to="/blog"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Voltar para o blog
        </Link>

        <header className="mx-auto mt-6 max-w-5xl text-center">
          <h1 className="text-balance text-[2rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          <time
            dateTime={post.dateISO}
            className="mt-5 block text-lg font-semibold text-foreground md:text-2xl"
          >
            {displayDate}
          </time>

          <div className="mt-6 flex flex-col items-center">
            <img
              src={authorAvatar}
              alt="Guilherme Correia"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-border md:h-20 md:w-20"
            />
            <div className="mt-3 text-2xl font-medium text-foreground">
              Guilherme Correia
            </div>
            <div className="mt-1 text-sm text-muted-foreground md:text-base">
              Estrategia de growth, dados e IA aplicada a negocios
            </div>
          </div>
        </header>

        {coverImage && (
          <div className="relative mt-7 overflow-hidden bg-card">
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-secondary via-background to-muted text-primary/45">
              <BookOpen className="h-10 w-10" aria-hidden="true" />
            </div>
            <img
              src={coverImage}
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
              className="relative h-[180px] w-full object-cover md:h-[250px] lg:h-[320px]"
            />
          </div>
        )}

        <div className="mt-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:gap-8">
          {toc.length > 0 && (
            <aside className="hidden lg:row-span-2 lg:block">
              <div className="sticky top-24">
                <h3 className="text-2xl font-medium leading-tight text-foreground md:text-3xl">
                  Navegue pelo índice
                </h3>

                <div className="mt-6 h-2 w-full rounded-full bg-border">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-200"
                    style={{ width: `${Math.max(6, readProgress)}%` }}
                  />
                </div>

                {toc.length > 0 && (
                  <>
                    <div className="mt-5 text-xl font-medium text-primary">
                      Ir para:
                    </div>

                    <div className="mt-4 max-h-[62vh] overflow-auto pr-2">
                      <ul className="space-y-3">
                        {toc.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => handleTocClick(item.id)}
                              className={[
                                "w-full text-left text-base leading-snug transition-colors",
                                item.level === 3 ? "pl-4" : "",
                                activeHeading === item.id
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground hover:text-foreground",
                              ].join(" ")}
                            >
                              {item.text}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </aside>
          )}

          <div className="min-w-0 lg:col-start-2">
            <div className="mb-8 rounded-xl border bg-muted/40 p-4 sm:rounded-2xl sm:p-5">
              <p className="text-base leading-relaxed text-foreground/80 sm:text-lg">
                {post.excerpt}
              </p>
            </div>

            <article
              ref={articleRef}
            >
              <BlogContentRenderer
                content={post.content}
                style={articleStyle}
                stripLeadingImage
              />
            </article>
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
                  Receba artigos estrategicos sobre marketing, vendas e dados
                  direto da pratica, sem teoria generica.
                </p>

                <form
                  onSubmit={handleNewsletterSubmit}
                  className="mt-5 space-y-2.5"
                >
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
                    disabled={isSubmittingNewsletter}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    {isSubmittingNewsletter ? "ENVIANDO..." : "ENVIAR"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Sem spam. Cancele quando quiser.
                </p>
              </div>

              <div className="rounded-2xl border bg-primary text-primary-foreground p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
                  Materiais gratuitos
                </div>

                <h3 className="mt-3 text-xl font-semibold leading-tight">
                  Guias práticos para aplicar growth com mais previsibilidade
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                  Acesse frameworks, pesquisas e conteúdos complementares para
                  aprofundar o tema deste artigo.
                </p>

                <Link
                  to="/biblioteca"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-background/90"
                >
                  Ver biblioteca →
                </Link>
              </div>

              <div className="rounded-2xl border bg-card p-5 text-center">
                <div className="text-lg font-semibold leading-tight text-foreground">
                  Gostou? Compartilhe:
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Compartilhar no WhatsApp"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Compartilhar no LinkedIn"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Compartilhar no X"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyCurrentLink()}
                    aria-label="Copiar link do artigo"
                    title="Copiar link do artigo"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    aria-label="Compartilhar pelo celular"
                    title="Compartilhar pelo celular"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 flex flex-col items-center">
                  <img
                    src={authorAvatar}
                    alt="Guilherme Correia"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
                  />
                  <div className="mt-2.5 text-xl font-medium text-foreground">
                    Guilherme Correia
                  </div>
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
