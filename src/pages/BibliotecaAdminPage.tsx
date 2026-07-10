// src/pages/BibliotecaAdminPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Pencil, Eye, EyeOff, Search, LogOut, Library, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import AdminHeader from "@/components/AdminHeader";

import {
    MaterialItem,
    MaterialAccess,
    MaterialType,
    deleteMaterialFromApi,
    fetchMaterialsFromApi,
    getMaterialAccess,
    getMaterialAccessLabel,
    saveMaterialToApi,
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
    coverImage: string;
    tagsText: string; // "tag1, tag2"
    href: string;
    slug: string;
    published: boolean;
    access: MaterialAccess;
    hasDownload: boolean;
    downloadUrl: string;
    downloadButtonLabel: string;
};

function itemToForm(m?: MaterialItem): FormState {
    return {
        type: m?.type ?? "Livro",
        title: m?.title ?? "",
        desc: m?.desc ?? "",
        coverImage: m?.coverImage ?? "",
        tagsText: (m?.tags ?? []).join(", "),
        href: m?.href ?? "",
        slug: m?.slug ?? "",
        published: m?.published ?? true,
        access: m?.access ?? "free",
        hasDownload: m?.hasDownload ?? false,
        downloadUrl: m?.downloadUrl ?? "",
        downloadButtonLabel: m?.downloadButtonLabel ?? "Download",
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
    const [isLoadingItems, setIsLoadingItems] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [q, setQ] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<FormState>(itemToForm());
    const coverUploadRef = useRef<HTMLInputElement | null>(null);

    async function refresh() {
        setIsLoadingItems(true);
        try {
            const data = await fetchMaterialsFromApi(false);
            setItems(data);
        } catch (error) {
            console.error(error);
            alert("Não foi possível carregar os materiais do banco.");
        } finally {
            setIsLoadingItems(false);
        }
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

    function handleCoverUpload(file: File | null) {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Selecione um arquivo de imagem.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            if (!result) {
                alert("Nao foi possivel carregar a imagem.");
                return;
            }

            setForm((s) => ({ ...s, coverImage: result }));
        };
        reader.readAsDataURL(file);
    }

    function removeCoverImage() {
        setForm((s) => ({ ...s, coverImage: "" }));
        if (coverUploadRef.current) {
            coverUploadRef.current.value = "";
        }
    }

    async function save() {
        if (!form.title.trim()) return alert("Título é obrigatório.");
        if (!form.desc.trim()) return alert("Descrição é obrigatória.");

        const payload: MaterialItem = {
            id: editingId ?? "",
            type: form.type,
            title: form.title.trim(),
            desc: form.desc.trim(),
            coverImage: form.coverImage.trim(),
            tags: parseTags(form.tagsText),
            href: form.href.trim(),
            slug: form.slug.trim(),
            published: form.published,
            access: form.access,
            hasDownload: form.access === "free" ? form.hasDownload : false,
            downloadUrl: form.access === "free" && form.hasDownload ? form.downloadUrl.trim() : null,
            downloadButtonLabel: form.downloadButtonLabel.trim() || "Download",
        };

        setIsSaving(true);
        try {
            await saveMaterialToApi(payload);
            await refresh();
            close();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Não foi possível salvar o material.");
        } finally {
            setIsSaving(false);
        }
    }

    async function togglePublish(m: MaterialItem) {
        try {
            await saveMaterialToApi({ ...m, published: !m.published });
            await refresh();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Não foi possível atualizar o material.");
        }
    }

    async function remove(m: MaterialItem) {
        if (!confirm(`Excluir "${m.title}"?`)) return;
        try {
            await deleteMaterialFromApi(m.id);
            await refresh();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Não foi possível excluir o material.");
        }
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
                                        <span
                                            className={[
                                                "rounded-full border px-2 py-1",
                                                getMaterialAccess(m) === "paid"
                                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
                                            ].join(" ")}
                                        >
                                            {getMaterialAccessLabel(m)}
                                        </span>
                                        {m.hasDownload && m.downloadUrl ? (
                                            <span className="rounded-full border bg-background px-2 py-1">
                                                Download
                                            </span>
                                        ) : null}
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

                    {isLoadingItems && (
                        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
                            Carregando materiais do banco...
                        </div>
                    )}

                    {!isLoadingItems && filtered.length === 0 && (
                        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
                            Nenhum material encontrado.
                        </div>
                    )}
                </div>
            </section>

            {/* modal simples */}
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
                    <div className="mx-auto w-full max-w-xl rounded-2xl border bg-card p-5 max-h-[calc(100svh-2rem)] overflow-y-auto">
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
                                <span className="text-sm text-muted-foreground">Imagem do material (URL) — opcional</span>
                                <Input
                                    value={form.coverImage}
                                    onChange={(e) => setForm((s) => ({ ...s, coverImage: e.target.value }))}
                                    placeholder="https://.../capa.jpg"
                                />
                            </label>

                            <div className="grid gap-3 rounded-xl border bg-background/60 p-3">
                                <input
                                    ref={coverUploadRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleCoverUpload(e.target.files?.[0] ?? null)}
                                />

                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => coverUploadRef.current?.click()}
                                    >
                                        <ImagePlus className="h-4 w-4" />
                                        Enviar imagem
                                    </Button>

                                    {form.coverImage ? (
                                        <Button type="button" variant="ghost" onClick={removeCoverImage}>
                                            Remover imagem
                                        </Button>
                                    ) : null}
                                </div>

                                {form.coverImage ? (
                                    <div className="overflow-hidden rounded-xl border bg-muted">
                                        <img
                                            src={form.coverImage}
                                            alt="Preview da capa do material"
                                            className="h-48 w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                                        Nenhuma imagem selecionada
                                    </div>
                                )}
                            </div>

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
                                <span className="text-sm text-muted-foreground">Tipo de acesso</span>
                                <select
                                    value={form.access}
                                    onChange={(e) =>
                                        setForm((s) => ({
                                            ...s,
                                            access: e.target.value as MaterialAccess,
                                            hasDownload: e.target.value === "free" ? s.hasDownload : false,
                                        }))
                                    }
                                    className="h-10 rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="free">Gratuito</option>
                                    <option value="paid">Pago</option>
                                </select>
                            </label>

                            <div className="grid gap-3 rounded-xl border bg-background/60 p-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.hasDownload}
                                        disabled={form.access === "paid"}
                                        onChange={(e) => setForm((s) => ({ ...s, hasDownload: e.target.checked }))}
                                    />
                                    <span className="text-sm">Possui download?</span>
                                </label>

                                <label className="grid gap-1">
                                    <span className="text-sm text-muted-foreground">URL/caminho do arquivo de download</span>
                                    <Input
                                        value={form.downloadUrl}
                                        disabled={form.access === "paid" || !form.hasDownload}
                                        onChange={(e) => setForm((s) => ({ ...s, downloadUrl: e.target.value }))}
                                        placeholder="/materials/playbook-gtm.pdf"
                                    />
                                </label>

                                <label className="grid gap-1">
                                    <span className="text-sm text-muted-foreground">Texto do botao de download</span>
                                    <Input
                                        value={form.downloadButtonLabel}
                                        disabled={form.access === "paid"}
                                        onChange={(e) => setForm((s) => ({ ...s, downloadButtonLabel: e.target.value }))}
                                        placeholder="Download"
                                    />
                                </label>
                            </div>

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
                                <Button onClick={save} disabled={isSaving}>
                                    {isSaving ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
