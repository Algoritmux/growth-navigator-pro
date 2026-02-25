import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getPublishedMaterials, MATERIAL_CATEGORIES } from "@/lib/materials-store";

export default function MaterialPage() {
    const { slug } = useParams<{ slug: string }>();

    const material = getPublishedMaterials().find((m) => m.slug === slug);

    if (!material) {
        return (
            <main className="min-h-screen bg-background text-foreground">
                <section className="mx-auto w-full max-w-4xl px-5 py-10">
                    <div className="rounded-2xl border bg-card p-8">
                        <h1 className="text-2xl font-bold">Material não encontrado</h1>
                        <p className="mt-2 text-muted-foreground">
                            Esse material não existe ou não está publicado.
                        </p>
                        <div className="mt-6">
                            <Button asChild variant="outline">
                                <Link to="/biblioteca" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Voltar para Biblioteca
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    const cat = MATERIAL_CATEGORIES.find((c) => c.value === material.type);
    const Icon = cat?.icon;

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="mx-auto w-full max-w-5xl px-5 py-10">
                <div className="mb-6 flex items-center justify-between">
                    <Button asChild variant="ghost" className="gap-2">
                        <Link to="/biblioteca">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        Biblioteca / <span className="text-foreground">{material.title}</span>
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                        {/* Imagem / capa (placeholder por enquanto) */}
                        <div className="w-full md:w-[320px]">
                            <div className="aspect-[4/3] w-full rounded-2xl border bg-muted flex items-center justify-center">
                                <span className="text-sm text-muted-foreground">
                                    Capa/Imagem do material
                                </span>
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                {Icon ? (
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                ) : null}

                                <span className="text-xs font-mono text-accent uppercase">
                                    {material.type}
                                </span>
                            </div>

                            <h1 className="mt-4 text-2xl md:text-3xl font-bold leading-tight">
                                {material.title}
                            </h1>

                            <p className="mt-3 text-muted-foreground">
                                {material.desc}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {material.tags.map((t) => (
                                    <span
                                        key={t}
                                        className="rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {material.href && material.href !== "#" ? (
                                    <Button asChild className="gap-2">
                                        <a href={material.href} target="_blank" rel="noreferrer">
                                            Acessar material <ArrowRight className="h-4 w-4" />
                                        </a>
                                    </Button>
                                ) : (
                                    <Button disabled className="gap-2">
                                        Acessar material <ArrowRight className="h-4 w-4" />
                                    </Button>
                                )}

                                <Button asChild variant="outline">
                                    <Link to="/biblioteca">Ver todos</Link>
                                </Button>
                            </div>

                            {/* Aqui você pode colocar: preço, “pago/grátis”, bullets, etc */}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}