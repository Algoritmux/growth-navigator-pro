import { getAdminAuthHeaders } from "./authSession";
import { API_BASE_URL } from "./api";
import { extractCoverImageSrc } from "./markdown";
import { getBlogPublicationStatus, type BlogPublicationStatus } from "./blogSchedule";

export type BlogCategory = "GTM" | "ICP" | "Oferta" | "Sales" | "Growth" | "IA";

export type BlogPost = {
    id: string; // uuid simples
    slug: string;
    title: string;
    excerpt: string;
    dateISO: string; // "YYYY-MM-DD"
    publishTime?: string; // "HH:MM"
    readTime: string; // "6 min"
    category: BlogCategory;
    tags: string[];
    content: string; // markdown simples (por enquanto)
    coverImage?: string;
    editorSettings?: {
        font?: "theme" | "arial" | "georgia" | "times";
        fontSize?: number;
        lineHeight?: number;
        paragraphSpaceBefore?: number;
        paragraphSpaceAfter?: number;
    };
    published: boolean;
    status?: BlogPublicationStatus;
    updatedAtISO: string;
};

const STORAGE_KEY = "gc_blog_posts_v1";

const seedPosts: BlogPost[] = [
    {
        id: "p1",
        slug: "guia-gtm-da-estrategia-a-execucao",
        title: "Guia de GTM: da estratégia à execução",
        excerpt:
            "Como estruturar ICP, proposta de valor, canais e playbook comercial sem depender de achismos.",
        dateISO: "2026-02-18",
        readTime: "8 min",
        category: "GTM",
        tags: ["gtm", "posicionamento", "playbook"],
        content: `# Guia de GTM

Escreva seu conteúdo aqui em Markdown.

## Estrutura sugerida
- Problema
- Diagnóstico
- Framework
- Passo a passo
- CTA`,
        published: true,
        updatedAtISO: "2026-02-18",
    },
    {
        id: "p2",
        slug: "Go-to-Market: por que bons produtos fracassam",
        title: "Go-to-Market: por que bons produtos fracassam",
        excerpt:
            "Go-to-Market e a estrategia que define para quem sua solucao realmente e, como o cliente percebe valor e qual caminho reduz o atrito ate a compra.",
        dateISO: "2026-03-01",
        readTime: "8 min",
        category: "GTM",
        tags: ["gtm", "posicionamento", "playbook"],
        content: `# Go-to-Market: por que bons produtos fracassam

Um bom produto nao garante tracao. Sem um Go-to-Market bem executado, a proposta de valor nao chega ao ICP correto.

## Onde os lancamentos travam
- Mensagem generica para publico amplo
- Canal certo com oferta errada
- Time comercial sem playbook claro

## Como destravar
1. Defina ICP e dor prioritaria
2. Reforce proposta de valor com prova
3. Estruture canal + abordagem + objecoes
4. Meça taxa de conversao por etapa

## Resultado esperado
Menos atrito na jornada, ciclos mais curtos e previsibilidade para escalar aquisicao e receita.`,
        published: true,
        updatedAtISO: "2026-03-01",
    },
];

function safeParse(json: string | null) {
    try {
        return json ? (JSON.parse(json) as BlogPost[]) : null;
    } catch {
        return null;
    }
}

export function loadPosts(): BlogPost[] {
    const data = safeParse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(data) && data.length) {
        // Keep user-created posts and append missing seeded posts on existing browsers.
        const seenIds = new Set(data.map((post) => post.id));
        const seenSlugs = new Set(data.map((post) => post.slug));
        const missingSeeds = seedPosts.filter((seed) => !seenIds.has(seed.id) && !seenSlugs.has(seed.slug));
        if (missingSeeds.length > 0) {
            const merged = [...data, ...missingSeeds];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
        }
        return data;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
    return seedPosts;
}

export function savePosts(posts: BlogPost[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function getAllPosts(): BlogPost[] {
    return loadPosts().sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
}

export function getPublishedPosts(): BlogPost[] {
    return getAllPosts().filter((p) => p.published);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
    return getAllPosts().find((p) => p.slug === slug);
}

export function upsertPost(post: BlogPost) {
    const posts = getAllPosts();
    const idx = posts.findIndex((p) => p.id === post.id);
    const next = idx >= 0 ? posts.map((p) => (p.id === post.id ? post : p)) : [post, ...posts];
    savePosts(next);
}

export function deletePost(id: string) {
    const posts = getAllPosts().filter((p) => p.id !== id);
    savePosts(posts);
}

function mapApiPost(post: Record<string, any>): BlogPost {
    const publishedDate = String(post.published_at || post.created_at || "").slice(0, 10);
    const publishTime = String(post.published_at || "").slice(11, 16);
    const updatedDate = String(post.updated_at || post.created_at || "").slice(0, 10);
    const content = String(post.content || "");
    const coverImage =
        String(post.cover_image || post.coverImage || "").trim() ||
        extractCoverImageSrc(content);

    const mappedPost: BlogPost = {
        id: String(post.id),
        slug: String(post.slug || ""),
        title: String(post.title || ""),
        excerpt: String(post.excerpt || ""),
        dateISO: publishedDate || new Date().toISOString().slice(0, 10),
        publishTime: publishTime || "09:00",
        readTime: String(post.read_time || "5 min"),
        category: (post.category || "GTM") as BlogCategory,
        tags: Array.isArray(post.tags) ? post.tags : [],
        content,
        coverImage: coverImage || undefined,
        editorSettings: {
            font: post.editor_font || "theme",
            fontSize: Number(post.editor_font_size || 18),
            lineHeight: Number(post.editor_line_height || 1.15),
            paragraphSpaceBefore: Number(post.paragraph_space_before || 8),
            paragraphSpaceAfter: Number(post.paragraph_space_after || 12),
        },
        published: Boolean(post.published),
        updatedAtISO: updatedDate || publishedDate || new Date().toISOString().slice(0, 10),
    };

    return {
        ...mappedPost,
        status: getBlogPublicationStatus(mappedPost),
    };
}

async function readApiResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Erro na API.");
    }

    return data as T;
}

export async function fetchPostsFromApi(publishedOnly = false): Promise<BlogPost[]> {
    const url = `${API_BASE_URL}/blog/list.php${publishedOnly ? "?published=1" : ""}`;
    const response = await fetch(url, {
        cache: "no-store",
        headers: publishedOnly ? undefined : getAdminAuthHeaders(),
    });
    const data = await readApiResponse<{ posts: Record<string, any>[] }>(response);

    return data.posts.map(mapApiPost);
}

export async function fetchPostBySlugFromApi(slug: string): Promise<BlogPost | undefined> {
    const response = await fetch(`${API_BASE_URL}/blog/show.php?slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
    });
    const data = await readApiResponse<{ post: Record<string, any> }>(response);

    return mapApiPost(data.post);
}

export async function savePostToApi(post: BlogPost): Promise<{ id: string; slug: string }> {
    const response = await fetch(`${API_BASE_URL}/blog/save.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
        },
        body: JSON.stringify(post),
    });

    const data = await readApiResponse<{ id: number | string; slug: string }>(response);

    return {
        id: String(data.id),
        slug: data.slug,
    };
}

export async function uploadBlogImageToApi(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/blog/upload-image.php`, {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: formData,
    });

    const data = await readApiResponse<{ url: string }>(response);
    return {
        url: data.url,
    };
}

export async function deletePostFromApi(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/blog/delete.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ id }),
    });

    await readApiResponse(response);
}

export function makeSlug(input: string) {
    return input
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export function makeId() {
    return `p_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
