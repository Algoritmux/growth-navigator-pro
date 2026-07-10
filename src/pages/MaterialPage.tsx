import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    fetchMaterialBySlugFromApi,
    getMaterialAccess,
    getMaterialAccessLabel,
    hasMaterialDownload,
    MATERIAL_CATEGORIES,
    type MaterialItem,
} from "@/lib/materials-store";
import { createLead } from "@/lib/leadsApi";
import SEO from "@/components/SEO";

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

export default function MaterialPage() {
    const { slug } = useParams<{ slug: string }>();
    const [material, setMaterial] = useState<MaterialItem | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);
    const [leadError, setLeadError] = useState("");
    const [isDownloadReleased, setIsDownloadReleased] = useState(false);
    const [leadForm, setLeadForm] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
    });

    useEffect(() => {
        let active = true;

        if (!slug) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setIsDownloadReleased(false);
        setLeadError("");
        fetchMaterialBySlugFromApi(slug)
            .then((data) => {
                if (active) setMaterial(data);
            })
            .catch((error) => {
                console.error(error);
                if (active) setMaterial(undefined);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [slug]);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background text-foreground">
                <section className="mx-auto w-full max-w-4xl px-5 py-10">
                    <div className="rounded-2xl border bg-card p-8">
                        <h1 className="text-2xl font-bold">Carregando material...</h1>
                    </div>
                </section>
            </main>
        );
    }

    if (!material || !material.published) {
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
    const access = getMaterialAccess(material);
    const accessLabel = getMaterialAccessLabel(material);
    const canDownload = hasMaterialDownload(material);
    const downloadButtonLabel = material.downloadButtonLabel?.trim() || "Download";
    const leadSource = access === "paid" ? "paid-material-interest" : "material-download";
    const isLeadFormValid =
        leadForm.name.trim() !== "" &&
        leadForm.email.trim() !== "" &&
        leadForm.phone.trim() !== "" &&
        leadForm.role.trim() !== "";

    function releaseDownload() {
        if (!canDownload || !material.downloadUrl) return;

        const anchor = document.createElement("a");
        anchor.href = material.downloadUrl;
        anchor.download = "";
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    }

    async function submitLeadForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLeadError("");

        if (!isLeadFormValid) {
            setLeadError("Preencha todos os campos obrigatorios.");
            return;
        }

        setIsSubmittingLead(true);
        try {
            await createLead({
                name: leadForm.name.trim(),
                email: leadForm.email.trim(),
                phone: leadForm.phone.trim(),
                service: `material:${material.slug || material.id}`,
                source: leadSource,
                message: [
                    `Material: ${material.title}`,
                    `Slug: ${material.slug || "sem-slug"}`,
                    `Cargo: ${leadForm.role.trim()}`,
                    `Tipo de acesso: ${accessLabel}`,
                ].join("\n"),
            });

            if (access === "free") {
                setIsDownloadReleased(true);
                releaseDownload();
            } else {
                setIsLeadModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            setLeadError(error instanceof Error ? error.message : "Nao foi possivel enviar seus dados.");
        } finally {
            setIsSubmittingLead(false);
        }
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <SEO
                title={material.title}
                description={material.desc}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "CreativeWork",
                    "name": material.title,
                    "headline": material.title,
                    "description": material.desc,
                    "author": {
                        "@type": "Person",
                        "name": "Guilherme Correia"
                    },
                    "genre": material.type,
                    "keywords": material.tags.join(", ")
                }}
            />
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
                        {/* Imagem / capa */}
                        <div className="w-full md:w-[320px]">
                            {material.coverImage ? (
                                <img
                                    src={material.coverImage}
                                    alt={`Capa de ${material.title}`}
                                    className="aspect-[4/3] w-full rounded-2xl border object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="aspect-[4/3] w-full rounded-2xl border bg-muted flex items-center justify-center">
                                    <span className="text-sm text-muted-foreground">
                                        Capa/Imagem do material
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                {Icon ? (
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                ) : null}

                                <span className="text-xs font-mono text-accent uppercase">
                                    {material.type}
                                </span>
                                <span
                                    className={[
                                        "rounded-full border px-2.5 py-1 text-xs font-semibold",
                                        access === "paid"
                                            ? "border-amber-200 bg-amber-50 text-amber-700"
                                            : "border-emerald-200 bg-emerald-50 text-emerald-700",
                                    ].join(" ")}
                                >
                                    {accessLabel}
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
                                        <a
                                            href={material.href}
                                            target={isExternalHref(material.href) ? "_blank" : undefined}
                                            rel={isExternalHref(material.href) ? "noopener noreferrer" : undefined}
                                        >
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

                                {access === "free" ? (
                                    canDownload ? (
                                        <Button
                                            type="button"
                                            variant="accent"
                                            className="gap-2 text-white hover:text-white"
                                            onClick={() => setIsLeadModalOpen(true)}
                                        >
                                            <Download className="h-4 w-4" />
                                            {downloadButtonLabel}
                                        </Button>
                                    ) : null
                                ) : (
                                    <Button
                                        type="button"
                                        variant="accent"
                                        className="gap-2 text-white hover:text-white"
                                        onClick={() => setIsLeadModalOpen(true)}
                                    >
                                        <LockKeyhole className="h-4 w-4" />
                                        Tenho interesse
                                    </Button>
                                )}
                            </div>

                            {/* Aqui você pode colocar: preço, “pago/grátis”, bullets, etc */}
                        </div>
                    </div>
                </div>
            </section>

            <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
                <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {access === "paid" ? "Solicitar acesso" : "Liberar download"}
                        </DialogTitle>
                        <DialogDescription>
                            {access === "paid"
                                ? "Envie seus dados para recebermos seu interesse nesse material."
                                : "Preencha seus dados para liberar o arquivo."}
                        </DialogDescription>
                    </DialogHeader>

                    {isDownloadReleased ? (
                        <div className="grid gap-4">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                                Obrigado! Seu download foi liberado.
                            </div>
                            {material.downloadUrl ? (
                                <Button asChild variant="accent" className="text-white hover:text-white">
                                    <a href={material.downloadUrl} download>
                                        Baixar agora
                                    </a>
                                </Button>
                            ) : null}
                        </div>
                    ) : (
                        <form className="grid gap-4" onSubmit={submitLeadForm}>
                            <label className="grid gap-1.5">
                                <span className="text-sm font-medium">Nome</span>
                                <Input
                                    required
                                    value={leadForm.name}
                                    onChange={(event) => setLeadForm((state) => ({ ...state, name: event.target.value }))}
                                    autoComplete="name"
                                />
                            </label>

                            <label className="grid gap-1.5">
                                <span className="text-sm font-medium">E-mail</span>
                                <Input
                                    required
                                    type="email"
                                    value={leadForm.email}
                                    onChange={(event) => setLeadForm((state) => ({ ...state, email: event.target.value }))}
                                    autoComplete="email"
                                />
                            </label>

                            <label className="grid gap-1.5">
                                <span className="text-sm font-medium">Nº telefone</span>
                                <Input
                                    required
                                    value={leadForm.phone}
                                    onChange={(event) => setLeadForm((state) => ({ ...state, phone: event.target.value }))}
                                    autoComplete="tel"
                                />
                            </label>

                            <label className="grid gap-1.5">
                                <span className="text-sm font-medium">Cargo</span>
                                <Input
                                    required
                                    value={leadForm.role}
                                    onChange={(event) => setLeadForm((state) => ({ ...state, role: event.target.value }))}
                                    autoComplete="organization-title"
                                />
                            </label>

                            {leadError ? (
                                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                                    {leadError}
                                </div>
                            ) : null}

                            <Button type="submit" disabled={isSubmittingLead || !isLeadFormValid} variant="accent" className="text-white hover:text-white">
                                {isSubmittingLead ? "Enviando..." : access === "paid" ? "Tenho interesse" : downloadButtonLabel}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}
