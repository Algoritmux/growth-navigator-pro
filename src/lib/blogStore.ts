export type BlogCategory = "GTM" | "ICP" | "Oferta" | "Sales" | "Growth" | "IA";

export type BlogPost = {
    id: string; // uuid simples
    slug: string;
    title: string;
    excerpt: string;
    dateISO: string; // "YYYY-MM-DD"
    readTime: string; // "6 min"
    category: BlogCategory;
    tags: string[];
    content: string; // markdown simples (por enquanto)
    published: boolean;
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
    if (Array.isArray(data) && data.length) return data;
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
