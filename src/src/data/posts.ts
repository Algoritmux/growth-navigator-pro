export type Post = {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    dateISO: string;
    readTime: string;
    category: "GTM" | "ICP" | "Oferta" | "Sales" | "Growth" | "IA";
    tags: string[];
};

export const posts: Post[] = [];
