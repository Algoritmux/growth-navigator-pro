import {
    BookOpen,
    FileText,
    Layout,
    Lightbulb,
    Search,
    Presentation,
    GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAdminAuthHeaders } from "./authSession";

export type MaterialType =
    | "Livro"
    | "E-book"
    | "Framework"
    | "Guia Estratégico"
    | "Pesquisa"
    | "Apresentação"
    | "Estudo Exclusivo";

export type MaterialCategoryValue = "all" | MaterialType;
export type MaterialAccess = "free" | "paid";

export type MaterialItem = {
    id: string;
    type: MaterialType;
    title: string;
    desc: string;
    tags: string[];

    slug?: string;

    href?: string;       // link externo (pago)
    published?: boolean; // aparece na /biblioteca
    coverImage?: string; // url da capa
    access?: MaterialAccess;
    hasDownload?: boolean;
    downloadUrl?: string | null;
    downloadButtonLabel?: string;
    ctaLabel?: string;   // texto do botão
};

export const MATERIAL_CATEGORIES: {
    icon: LucideIcon;
    label: string;
    value: MaterialCategoryValue;
}[] = [
        { icon: BookOpen, label: "Todos", value: "all" },
        { icon: BookOpen, label: "Livros", value: "Livro" },
        { icon: FileText, label: "E-books", value: "E-book" },
        { icon: Layout, label: "Frameworks", value: "Framework" },
        { icon: Lightbulb, label: "Guias Estratégicos", value: "Guia Estratégico" },
        { icon: Search, label: "Pesquisas", value: "Pesquisa" },
        { icon: Presentation, label: "Apresentações", value: "Apresentação" },
        { icon: GraduationCap, label: "Estudos Exclusivos", value: "Estudo Exclusivo" },
    ];

const STORAGE_KEY = "gc_materials_v1";
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== "undefined" && ["8080", "5173"].includes(window.location.port)
        ? "http://localhost/growth-navigator-pro/backend/api"
        : "/backend/api");

const SEED_MATERIALS: MaterialItem[] = [
    {
        id: "growth-driven",
        type: "Livro",
        title: "Growth-Driven: O Framework do Crescimento Previsível",
        desc: "O método completo para transformar operações comerciais em motores de crescimento escalável.",
        tags: ["Growth Marketing", "Estratégia"],
        slug: "growth-driven",
        published: true,
        coverImage: "https://.../capa.png", // pode deixar vazio por enquanto
        // href: "#"', // se for pago, coloque o link externo real aqui
        ctaLabel: "Acessar material",
        access: "free",
        hasDownload: true,
        downloadUrl: "/materials/growth-driven.pdf",
        downloadButtonLabel: "Download",
    },
    {
        id: "ia-vendas-b2b",
        type: "E-book",
        title: "Guia Prático de IA Aplicada a Vendas B2B",
        desc: "Como usar inteligência artificial para prever churn, qualificar leads e escalar receita.",
        tags: ["IA", "Vendas B2B"],
        slug: "ia-vendas-b2b",
        href: "#",
        published: true,
        coverImage: "https://.../capa.png", // pode deixar vazio por enquanto
        // href: "#", // se for pago, coloque o link externo real aqui
        ctaLabel: "Acessar material",
        access: "free",
        hasDownload: true,
        downloadUrl: "/materials/ia-vendas-b2b.pdf",
        downloadButtonLabel: "Download",
    },
    {
        id: "canvas-maturidade",
        type: "Framework",
        title: "Canvas de Maturidade Comercial",
        desc: "Ferramenta visual para diagnosticar o nível de estruturação da sua operação de vendas.",
        tags: ["Estratégia Comercial"],
        slug: "canvas-maturidade",
        href: "#",
        published: true,
        coverImage: "https://.../capa.png", // pode deixar vazio por enquanto
        // href: "#", // se for pago, coloque o link externo real aqui
        ctaLabel: "Acessar material",
        access: "free",
        hasDownload: true,
        downloadUrl: "/materials/canvas-maturidade.pdf",
        downloadButtonLabel: "Download",
    },
    {
        id: "arquitetura-vendas",
        type: "Guia Estratégico",
        title: "Da Prospecção à Expansão: Arquitetura de Vendas Moderna",
        desc: "Guia completo sobre como estruturar cada etapa do funil para máxima previsibilidade.",
        tags: ["Vendas", "Growth"],
        slug: "arquitetura-vendas",
        href: "#",
        published: true,
        coverImage: "https://.../capa.png", // pode deixar vazio por enquanto
        // href: "#", // se for pago, coloque o link externo real aqui
        ctaLabel: "Acessar material",
        access: "free",
        hasDownload: true,
        downloadUrl: "/materials/arquitetura-vendas.pdf",
        downloadButtonLabel: "Download",
    },
    {
        id: "panorama-growth-2025",
        type: "Pesquisa",
        title: "Panorama Growth Brasil 2025",
        desc: "Dados exclusivos sobre maturidade de growth marketing em empresas brasileiras.",
        tags: ["Growth Marketing", "Dados"],
        slug: "panorama-growth-2025",
        href: "#",
        published: true,
        coverImage: "https://.../capa.png", // pode deixar vazio por enquanto
        // href: "#", // se for pago, coloque o link externo real aqui
        ctaLabel: "Acessar material",
        access: "free",
        hasDownload: true,
        downloadUrl: "/materials/panorama-growth-2025.pdf",
        downloadButtonLabel: "Download",
    },
    {
        id: "keynote-futuro",
        type: "Apresentação",
        title: "Keynote: O Futuro do Marketing é Comercial",
        desc: "Slides da palestra sobre a convergência entre marketing, vendas e dados.",
        tags: ["Marketing", "Vendas"],
        slug: "keynote-futuro",
        href: "#",
        published: true,
        coverImage: "https://.../capa.png", // pode deixar vazio por enquanto
        // href: "#", // se for pago, coloque o link externo real aqui
        ctaLabel: "Acessar material",
        access: "free",
        hasDownload: true,
        downloadUrl: "/materials/keynote-futuro.pdf",
        downloadButtonLabel: "Download",
    },
    {
        id: "case-triplicar-receita",
        type: "Estudo Exclusivo",
        title: "Case: Como Triplicar Receita em 8 Meses com Growth",
        desc: "Estudo detalhado de uma operação real transformada pelo framework Growth-Driven.",
        tags: ["Growth", "Case"],
        slug: "case-triplicar-receita",
        published: true,
        coverImage: "https://.../capa.png", // pode deixar vazio por enquanto
        //  href: "#", // se for pago, coloque o link externo real aqui
        ctaLabel: "Acessar material",
        access: "paid",
        hasDownload: false,
        downloadUrl: null,
        downloadButtonLabel: "Tenho interesse",
    },
];

function safeParse(json: string | null) {
    try {
        return json ? (JSON.parse(json) as MaterialItem[]) : null;
    } catch {
        return null;
    }
}

function stripRemovedPromptCover(items: MaterialItem[]) {
    let changed = false;

    const next = items.map((item) => {
        if (/^prompt de vendas\b/i.test(item.title) && item.coverImage === "/covers/prompt-de-vendas.svg") {
            changed = true;
            return { ...item, coverImage: "" };
        }

        return item;
    });

    return { changed, items: next };
}

export function loadMaterials(): MaterialItem[] {
    if (typeof window === "undefined") return stripRemovedPromptCover(SEED_MATERIALS).items;
    const data = safeParse(localStorage.getItem(STORAGE_KEY));

    if (Array.isArray(data) && data.length) {
        const normalized = stripRemovedPromptCover(data);
        if (normalized.changed) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized.items));
        }
        return normalized.items;
    }

    const seeded = stripRemovedPromptCover(SEED_MATERIALS).items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
}

export function saveMaterials(items: MaterialItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getAllMaterials(): MaterialItem[] {
    return loadMaterials();
}

export function getPublishedMaterials(): MaterialItem[] {
    return getAllMaterials().filter((m) => m.published);
}

export function getMaterialBySlug(slug: string): MaterialItem | undefined {
    return getAllMaterials().find((m) => m.slug === slug);
}

export function createMaterial(data: Omit<MaterialItem, "id">) {
    const items = getAllMaterials();
    const newItem: MaterialItem = {
        ...data,
        id: `mat_${Math.random().toString(16).slice(2)}_${Date.now()}`,
    };
    saveMaterials([newItem, ...items]);
    return newItem;
}

export function updateMaterial(id: string, data: Partial<Omit<MaterialItem, "id">>) {
    const items = getAllMaterials();
    const next = items.map((m) => (m.id === id ? { ...m, ...data } : m));
    saveMaterials(next);
}

export function deleteMaterial(id: string) {
    const items = getAllMaterials().filter((m) => m.id !== id);
    saveMaterials(items);
}

export function countMaterialsByCategory(value: MaterialCategoryValue) {
    if (value === "all") return getAllMaterials().length;
    return getAllMaterials().filter((m) => m.type === value).length;
}

export function getMaterialAccess(material: Pick<MaterialItem, "access">): MaterialAccess {
    return material.access === "paid" ? "paid" : "free";
}

export function getMaterialAccessLabel(material: Pick<MaterialItem, "access">) {
    return getMaterialAccess(material) === "paid" ? "Pago" : "Gratuito";
}

export function hasMaterialDownload(material: Pick<MaterialItem, "access" | "hasDownload" | "downloadUrl">) {
    return getMaterialAccess(material) === "free" && Boolean(material.hasDownload && material.downloadUrl);
}

function mapApiMaterial(material: Record<string, any>): MaterialItem {
    const access = material.access === "paid" || material.access_type === "paid" ? "paid" : "free";
    const rawDownloadUrl = material.downloadUrl ?? material.download_url ?? null;
    const downloadUrl = rawDownloadUrl ? String(rawDownloadUrl) : null;
    const hasDownload = access === "free" && Boolean(material.hasDownload ?? material.has_download) && Boolean(downloadUrl);

    return {
        id: String(material.id),
        type: (material.type || "Livro") as MaterialType,
        title: String(material.title || ""),
        desc: String(material.desc || material.description || ""),
        tags: Array.isArray(material.tags) ? material.tags : [],
        slug: material.slug ? String(material.slug) : "",
        href: material.href ? String(material.href) : "",
        published: Boolean(material.published),
        coverImage: material.coverImage ? String(material.coverImage) : "",
        ctaLabel: material.ctaLabel ? String(material.ctaLabel) : "Acessar material",
        access,
        hasDownload,
        downloadUrl,
        downloadButtonLabel: material.downloadButtonLabel || material.download_button_label
            ? String(material.downloadButtonLabel || material.download_button_label)
            : "Download",
    };
}

async function readApiResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Erro na API.");
    }

    return data as T;
}

export async function fetchMaterialsFromApi(publishedOnly = false): Promise<MaterialItem[]> {
    const url = `${API_BASE_URL}/materials/list.php${publishedOnly ? "?published=1" : ""}`;
    const response = await fetch(url, {
        headers: publishedOnly ? undefined : getAdminAuthHeaders(),
    });
    const data = await readApiResponse<{ materials: Record<string, any>[] }>(response);

    return data.materials.map(mapApiMaterial);
}

export async function fetchMaterialBySlugFromApi(slug: string): Promise<MaterialItem | undefined> {
    const response = await fetch(`${API_BASE_URL}/materials/show.php?slug=${encodeURIComponent(slug)}`);
    const data = await readApiResponse<{ material: Record<string, any> }>(response);

    return mapApiMaterial(data.material);
}

export async function saveMaterialToApi(material: Partial<MaterialItem> & Pick<MaterialItem, "title" | "desc" | "type">): Promise<{ id: string; slug: string }> {
    const response = await fetch(`${API_BASE_URL}/materials/save.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
        },
        body: JSON.stringify(material),
    });

    const data = await readApiResponse<{ id: number | string; slug: string }>(response);

    return {
        id: String(data.id),
        slug: data.slug,
    };
}

export async function deleteMaterialFromApi(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/materials/delete.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ id }),
    });

    await readApiResponse(response);
}
