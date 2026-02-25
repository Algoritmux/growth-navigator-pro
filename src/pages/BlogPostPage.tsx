import React from "react";
import { Link, useParams } from "react-router-dom";
import { getPostBySlug } from "@/lib/blogStore";

function simpleMarkdownToHtml(md: string) {
    // conversor BEM simples (pra agora). Depois trocamos por react-markdown.
    const escaped = md
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return escaped
        .replace(/^# (.*)$/gm, "<h1>$1</h1>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>")
        .replace(/^### (.*)$/gm, "<h3>$1</h3>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");
}

export default function BlogPostPage() {
    const { slug } = useParams();
    const post = slug ? getPostBySlug(slug) : undefined;

    if (!post || !post.published) {
        return (
            <main className="min-h-screen bg-background text-foreground">
                <section className="mx-auto w-full max-w-3xl px-5 py-10">
                    <Link to="/blog" className="text-sm text-muted-foreground hover:underline">
                        ← Voltar para o blog
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold">Post não encontrado</h1>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="mx-auto w-full max-w-3xl px-5 py-10">
                <Link to="/blog" className="text-sm text-muted-foreground hover:underline">
                    ← Voltar para o blog
                </Link>

                <h1 className="mt-4 text-3xl font-bold">{post.title}</h1>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border bg-background px-2 py-1">{post.category}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                    <span>•</span>
                    <time dateTime={post.dateISO}>{post.dateISO}</time>
                </div>

                <p className="mt-4 text-muted-foreground">{post.excerpt}</p>

                <article
                    className="mt-8 rounded-2xl border bg-card p-6 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(post.content) }}
                />

                <div className="mt-10 rounded-2xl border bg-card p-6">
                    <div className="text-sm font-semibold">Quer ajuda para implementar isso?</div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Eu te ajudo a estruturar GTM, oferta e playbook para crescimento previsível.
                    </p>
                    <a
                        href="/contato"
                        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground"
                    >
                        Agendar diagnóstico
                    </a>
                </div>
            </section>
        </main>
    );
}
