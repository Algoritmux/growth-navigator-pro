// src/pages/BibliotecaAdminPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Pencil, Eye, EyeOff, Search, LogOut, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import AdminHeader from "@/components/AdminHeader";

import {
    MaterialItem,
    MaterialType,
    getAllMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
} from "@/lib/materials-store";

const TYPES: MaterialType[] = [
    "Livro",
    "E-book",
    "Framework",
    "Guia Estratégico",
    "Pesquisa",
    "Apresentação",
    "Estudo Exclusivo",
];

type FormState = {
    type: MaterialType;
    title: string;
    desc: string;
    tagsText: string; // "tag1, tag2"
    href: string;
    slug: string;
    published: boolean;
};

function itemToForm(m?: MaterialItem): FormState {
    return {
        type: m?.type ?? "Livro",
        title: m?.title ?? "",
        desc: m?.desc ?? "",
        tagsText: (m?.tags ?? []).join(", "),
        href: m?.href ?? "",
        slug: m?.slug ?? "",
        published: m?.published ?? true,
    };
}

function parseTags(tagsText: string) {
    return tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
}

export default function BibliotecaAdminPage() {
    const [items, setItems] = useState<MaterialItem[]>([]);
    const [q, setQ] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<FormState>(itemToForm());

    function refresh() {
        setItems(getAllMaterials());
    }

    useEffect(() => {
        refresh();
    }, []);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return items;

        return items.filter((m) => {
            const hay = `${m.title} ${m.desc} ${m.type} ${m.tags.join(" ")}`.toLowerCase();
            return hay.includes(s);
        });
    }, [items, q]);

    function openNew() {
        setEditingId(null);
        setForm(itemToForm());
        setIsOpen(true);
    }

    function openEdit(m: MaterialItem) {
        setEditingId(m.id);
        setForm(itemToForm(m));
        setIsOpen(true);
    }

    function close() {
        setIsOpen(false);
    }

    function save() {
        if (!form.title.trim()) return alert("Título é obrigatório.");
        if (!form.desc.trim()) return alert("Descrição é obrigatória.");

        const payload = {
            type: form.type,
            title: form.title.trim(),
            desc: form.desc.trim(),
            tags: parseTags(form.tagsText),
            href: form.href.trim(),
            slug: form.slug.trim(),
            published: form.published,
        };

        if (!editingId) {
            createMaterial(payload);
        } else {
            updateMaterial(editingId, payload);
        }

        refresh();
        close();
    }

    function togglePublish(m: MaterialItem) {
        updateMaterial(m.id, { published: !m.published });
        refresh();
    }

    function remove(m: MaterialItem) {
        if (!confirm(`Excluir "${m.title}"?`)) return;
        deleteMaterial(m.id);
        refresh();
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <AdminHeader />

            <header className="border-b bg-card mt-6 mx-auto max-w-6xl rounded-2xl border px-5 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Library className="h-6 w-6 text-primary" />
                            Gestão da Biblioteca
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Cadastre materiais e escolha o que será publicado.
                        </p>
                    </div>

                    <Button onClick={openNew} className="gap-2 shadow-lg h-11 px-6 rounded-xl">
                        <Plus className="h-5 w-5" />
                        Novo Material
                    </Button>
                </div>
            </header>

            <section className="mx-auto w-full max-w-6xl px-5 py-10">
                <div className="rounded-2xl border bg-card p-6">
                    <h1 className="text-2xl font-bold">Admin — Biblioteca</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Cadastre materiais e publique/despublique. O que estiver publicado aparece em <b>/biblioteca</b>.
                    </p>

                    <div className="mt-5 flex items-center gap-2 rounded-xl border bg-background px-3 py-2 md:max-w-md">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por título, tipo, tag..."
                            className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                        />
                    </div>
                </div>

                <div className="mt-6 grid gap-3">
                    {filtered.map((m) => (
                        <div key={m.id} className="rounded-2xl border bg-card p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span className="rounded-full border bg-background px-2 py-1">{m.type}</span>
                                        <span className="rounded-full border bg-background px-2 py-1">
                                            {m.published ? "Publicado" : "Rascunho"}
                                        </span>
                                    </div>

                                    <div className="mt-2 text-base font-bold">{m.title}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{m.desc}</div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {m.tags.slice(0, 6).map((t) => (
                                            <span key={t} className="rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    <Button variant="outline" size="sm" onClick={() => togglePublish(m)} className="gap-2">
                                        {m.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        {m.published ? "Despublicar" : "Publicar"}
                                    </Button>

                                    <Button variant="outline" size="sm" onClick={() => openEdit(m)} className="gap-2">
                                        <Pencil className="h-4 w-4" />
                                        Editar
                                    </Button>

                                    <Button variant="destructive" size="sm" onClick={() => remove(m)} className="gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Excluir
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
                            Nenhum material encontrado.
                        </div>
                    )}
                </div>
            </section>

            {/* modal simples */}
            {isOpen && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-xl rounded-2xl border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-bold">{editingId ? "Editar material" : "Novo material"}</div>
                            <Button variant="ghost" onClick={close}>
                                Fechar
                            </Button>
                        </div>

                        <div className="mt-4 grid gap-3">
                            <label className="grid gap-1">
                                <span className="text-sm text-muted-foreground">Tipo</span>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as MaterialType }))}
                                    className="h-10 rounded-md border bg-background px-3 text-sm"
                                >
                                    {TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="grid gap-1">
                                <span className="text-sm text-muted-foreground">Título</span>
                                <Input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
                            </label>

                            <label className="grid gap-1">
                                <span className="text-sm text-muted-foreground">Descrição</span>
                                <textarea
                                    value={form.desc}
                                    onChange={(e) => setForm((s) => ({ ...s, desc: e.target.value }))}
                                    className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </label>

                            <label className="grid gap-1">
                                <span className="text-sm text-muted-foreground">Tags (separadas por vírgula)</span>
                                <Input
                                    value={form.tagsText}
                                    onChange={(e) => setForm((s) => ({ ...s, tagsText: e.target.value }))}
                                    placeholder="ex: Growth Marketing, Estratégia, IA"
                                />
                            </label>

                            <label className="grid gap-1">
                                <span className="text-sm text-muted-foreground">Link (href) — opcional (links externos)</span>
                                <Input
                                    value={form.href}
                                    onChange={(e) => setForm((s) => ({ ...s, href: e.target.value }))}
                                    placeholder="https://..."
                                />
                            </label>

                            <label className="grid gap-1">
                                <span className="text-sm text-muted-foreground">Slug (URL interna) — opcional</span>
                                <Input
                                    value={form.slug}
                                    onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
                                    placeholder="ex: meu-material-teste"
                                />
                                <span className="text-[10px] text-muted-foreground">
                                    Se preenchido, o link será /biblioteca/{form.slug || "slug"}
                                </span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.published}
                                    onChange={(e) => setForm((s) => ({ ...s, published: e.target.checked }))}
                                />
                                <span className="text-sm">Publicado</span>
                            </label>

                            <div className="mt-2 flex justify-end gap-2">
                                <Button variant="outline" onClick={close}>
                                    Cancelar
                                </Button>
                                <Button onClick={save}>Salvar</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}