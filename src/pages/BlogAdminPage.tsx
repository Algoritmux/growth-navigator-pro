import React, { useMemo, useState } from "react";
import {
    BlogPost,
    BlogCategory,
    deletePost,
    getAllPosts,
    makeId,
    makeSlug,
    upsertPost,
} from "@/lib/blogStore";
import { useAuth } from "@/lib/auth";
import { LogOut } from "lucide-react";

const categories: BlogCategory[] = ["GTM", "ICP", "Oferta", "Sales", "Growth", "IA"];

export default function BlogAdminPage() {
    const [refresh, setRefresh] = useState(0);
    const posts = useMemo(() => getAllPosts(), [refresh]);

    const [editing, setEditing] = useState<BlogPost | null>(null);

    function startNew() {
        const today = new Date().toISOString().slice(0, 10);
        setEditing({
            id: makeId(),
            title: "",
            slug: "",
            excerpt: "",
            dateISO: today,
            readTime: "5 min",
            category: "GTM",
            tags: [],
            content: "",
            published: false,
            updatedAtISO: today,
        });
    }

    function save() {
        if (!editing) return;

        const title = editing.title.trim();
        const slug = editing.slug.trim() || makeSlug(title);

        if (!title) {
            alert("Título é obrigatório.");
            return;
        }

        const today = new Date().toISOString().slice(0, 10);

        upsertPost({
            ...editing,
            title,
            slug,
            updatedAtISO: today,
        });

        setEditing(null);
        setRefresh((r) => r + 1);
    }

    function remove(id: string) {
        if (!confirm("Excluir este post?")) return;
        deletePost(id);
        setRefresh((r) => r + 1);
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="mx-auto w-full max-w-6xl px-5 py-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">Admin do Blog</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Crie/edite posts. Lista e página do post sincronizam automaticamente.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={startNew}
                            className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                        >
                            + Novo post
                        </button>
                        <button
                            onClick={() => {
                                if (confirm("Deseja sair da área administrativa?")) {
                                    window.location.href = "/";
                                    setTimeout(() => localStorage.removeItem("admin_user"), 100);
                                }
                            }}
                            className="h-10 rounded-xl border bg-card px-4 text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    {/* LISTA */}
                    <div className="rounded-2xl border bg-card p-4">
                        <div className="text-sm font-semibold">Posts</div>
                        <div className="mt-3 space-y-2">
                            {posts.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold">{p.title || "(Sem título)"}</div>
                                        <div className="truncate text-xs text-muted-foreground">
                                            /blog/{p.slug || "(sem-slug)"} • {p.published ? "Publicado" : "Rascunho"}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditing(p)}
                                            className="h-9 rounded-lg border bg-card px-3 text-sm"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => remove(p.id)}
                                            className="h-9 rounded-lg border bg-card px-3 text-sm"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {posts.length === 0 && (
                                <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                                    Sem posts ainda.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* EDITOR */}
                    <div className="rounded-2xl border bg-card p-4">
                        <div className="text-sm font-semibold">Editor</div>

                        {!editing ? (
                            <div className="mt-3 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                                Clique em “Novo post” ou “Editar”.
                            </div>
                        ) : (
                            <div className="mt-3 space-y-3">
                                <input
                                    value={editing.title}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                    placeholder="Título"
                                    className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                                />

                                <div className="grid gap-3 md:grid-cols-2">
                                    <input
                                        value={editing.slug}
                                        onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                                        placeholder="Slug (opcional — gera automático)"
                                        className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                                    />
                                    <input
                                        value={editing.dateISO}
                                        onChange={(e) => setEditing({ ...editing, dateISO: e.target.value })}
                                        className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                                        type="date"
                                    />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <select
                                        value={editing.category}
                                        onChange={(e) =>
                                            setEditing({ ...editing, category: e.target.value as BlogCategory })
                                        }
                                        className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        value={editing.readTime}
                                        onChange={(e) => setEditing({ ...editing, readTime: e.target.value })}
                                        placeholder="Tempo de leitura (ex: 6 min)"
                                        className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                                    />
                                </div>

                                <textarea
                                    value={editing.excerpt}
                                    onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                                    placeholder="Excerpt (resumo curto)"
                                    className="min-h-[90px] w-full rounded-xl border bg-background p-3 outline-none"
                                />

                                <input
                                    value={editing.tags.join(", ")}
                                    onChange={(e) =>
                                        setEditing({
                                            ...editing,
                                            tags: e.target.value
                                                .split(",")
                                                .map((t) => t.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                    placeholder="Tags (separadas por vírgula)"
                                    className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                                />

                                <textarea
                                    value={editing.content}
                                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                                    placeholder="Conteúdo do post (Markdown simples)"
                                    className="min-h-[220px] w-full rounded-xl border bg-background p-3 outline-none"
                                />

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={editing.published}
                                        onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                                    />
                                    Publicado
                                </label>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={save}
                                        className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        onClick={() => setEditing(null)}
                                        className="h-10 rounded-xl border bg-card px-4 text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    Dica: se você deixar “Slug” vazio, ele será gerado automaticamente do título.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
