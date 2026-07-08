import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  BarChart3,
  Handshake,
  Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/blogStore";
import { fetchPublishedBlogPosts } from "@/lib/blogApi";
import { extractFirstImageSrc } from "@/lib/markdown";
import { useEffect, useState } from "react";

/**
 * Mapeia as categorias internas do blog (store) para os labels da Home
 * Ajuste aqui se quiser mudar nomes.
 */
const CATEGORY_LABEL: Record<string, string> = {
  GTM: "Growth Marketing",
  ICP: "Reflexões Estratégicas",
  Oferta: "Estratégia Comercial",
  Sales: "Negociação",
  Growth: "Growth Marketing",
  IA: "IA aplicada aos negócios",
};

/**
 * Ícones por label (igual ao layout atual)
 */
const ICON_BY_LABEL: Record<string, LucideIcon> = {
  "Growth Marketing": BarChart3,
  "IA aplicada aos negócios": Brain,
  "Estratégia Comercial": Lightbulb,
  Negociação: Handshake,
  "Liderança e Gestão": BookOpen,
  "Reflexões Estratégicas": BookOpen,
};

const ORDERED_LABELS = [
  "Growth Marketing",
  "IA aplicada aos negócios",
  "Estratégia Comercial",
  "Negociação",
  "Liderança e Gestão",
  "Reflexões Estratégicas",
];

const ContentSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let active = true;

    fetchPublishedBlogPosts()
      .then((data) => {
        if (active) setPosts(data);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      active = false;
    };
  }, []);

  // ✅ chips com contagem real
  const categories = (() => {
    const counts = new Map<string, number>();

    for (const p of posts) {
      const label = CATEGORY_LABEL[p.category] ?? p.category;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    return ORDERED_LABELS.filter((label) => (counts.get(label) ?? 0) > 0).map(
      (label) => {
        const icon = ICON_BY_LABEL[label] ?? BookOpen;
        return { icon, label, count: counts.get(label) ?? 0 };
      },
    );
  })();

  // ✅ 3 mais recentes (mantém o “featured” da Home)
  const featuredArticles = posts
    .slice()
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      category: (CATEGORY_LABEL[p.category] ?? p.category) as string,
      title: p.title,
      excerpt: p.excerpt,
      readTime: p.readTime,
      image: extractFirstImageSrc(p.content),
    }));

  return (
    <section id="insights" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="max-w-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">
            Blog & Insights
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Hub de conhecimento estratégico
          </h2>
          <p className="text-muted-foreground text-lg">
            Artigos estratégicos sobre crescimento, dados e inteligência
            aplicada a negócios.
          </p>
        </motion.div>

        {/* Categories (contagem real) */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              // opcional: ao clicar, manda pro /blog já filtrado via querystring
              onClick={() => {
                // mantém comportamento simples: vai pro /blog (lá você filtra)
                window.location.href = `/blog`;
              }}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
              <span className="text-xs text-muted-foreground ml-1">
                ({cat.count})
              </span>
            </motion.button>
          ))}
        </div>

        {/* Featured Articles (clicável e linkado no post) */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredArticles.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={`/blog/${article.slug}`} className="block">
                <article className="group p-6 rounded-2xl bg-card border border-border hover:shadow-elevated transition-all duration-300 cursor-pointer">
                  {article.image && (
                    <div className="relative mb-4 overflow-hidden rounded-xl border border-border/70 bg-muted/30">
                      <img
                        src={article.image}
                        alt={article.title}
                        loading="lazy"
                        className="h-44 w-full object-cover transition-[transform,filter] duration-300 group-hover:scale-[1.02] [filter:grayscale(1)_sepia(1)_hue-rotate(235deg)_saturate(7)_brightness(0.72)_contrast(1.1)] group-hover:[filter:none]"
                      />
                    </div>
                  )}
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-3 mb-3 group-hover:text-primary transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {article.readTime} de leitura
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-primary transition-all text-sm group"
            asChild
          >
            <Link to="/blog">
              Ver todos os artigos do blog
              <ArrowRight className="w-4 h-4 ml-2 opacity-40 group-hover:opacity-100 transition-opacity" />
            </Link>
          </Button>
        </motion.div>

        {/* Estado vazio (se ainda não tem posts no store) */}
        {featuredArticles.length === 0 && (
          <div className="mt-10 rounded-2xl border bg-card p-8 text-center">
            <div className="text-lg font-bold text-foreground">
              Sem artigos ainda
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Estamos preparando conteúdos incríveis para você. Em breve
              traremos novidades!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContentSection;
