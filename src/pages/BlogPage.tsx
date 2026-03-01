import { getPublishedPosts } from "@/lib/blogStore";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const CATEGORIES = ["Todos", "GTM", "ICP", "Oferta", "Sales", "Growth", "IA"] as const;
type Category = (typeof CATEGORIES)[number];

function formatDatePtBR(dateISO: string) {
  const d = new Date(`${dateISO}T00:00:00`);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BlogPage() {
  const POSTS = getPublishedPosts();
  const isMobile = useIsMobile();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("Todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return POSTS.filter((p) => {
      const matchCategory = category === "Todos" ? true : p.category === category;
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchQuery;
    });
  }, [POSTS, query, category]);

  const visiblePosts = useMemo(() => {
    return isMobile ? filtered.slice(0, 3) : filtered;
  }, [filtered, isMobile]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="rounded-2xl border bg-card p-6">
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Conteudos praticos sobre GTM, Growth, Inteligencia Comercial e IA.
          </p>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-2 rounded-xl border bg-background px-3 py-2 md:max-w-md">
              <span className="text-muted-foreground">🔎</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por tema, tag..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = c === category;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={[
                      "h-9 rounded-full border px-3 text-sm transition",
                      active ? "bg-muted" : "bg-background hover:bg-muted",
                    ].join(" ")}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((p) => (
            <Link
              key={p.id ?? p.slug}
              to={`/blog/${p.slug}`}
              className="rounded-2xl border bg-card p-4 transition hover:bg-muted"
            >
              <div className="text-xs text-muted-foreground">
                <span className="rounded-full border bg-background px-2 py-1">{p.category}</span>
                <span className="mx-2">•</span>
                <span>{p.readTime}</span>
                <span className="mx-2">•</span>
                <time dateTime={p.dateISO}>{formatDatePtBR(p.dateISO)}</time>
              </div>

              <h3 className="mt-3 text-base font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags?.slice(0, 3).map((t: string) => (
                  <span
                    key={t}
                    className="rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-8 rounded-2xl border bg-card p-8 text-center">
            <div className="text-lg font-bold">Nada encontrado.</div>
            <p className="mt-2 text-sm text-muted-foreground">Tente outro termo ou categoria.</p>
          </div>
        )}
      </section>
    </main>
  );
}
