import { Link } from "react-router-dom";
import { LayoutDashboard, BookOpen, Library, LogOut, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

            <header className="border-b bg-background/60 backdrop-blur-xl sticky top-0 z-40">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/" className="gap-2 text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="h-4 w-4" />
                                Voltar ao site
                            </Link>
                        </Button>
                        <div className="h-4 w-[1px] bg-border hidden sm:block"></div>
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Painel Admin
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (confirm("Deseja sair da área administrativa?")) {
                                localStorage.removeItem("admin_user");
                                window.location.href = "/";
                            }
                        }}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                    </Button>
                </div>
            </header>

            <section className="flex-1 flex flex-col items-center justify-center p-5 animate-in fade-in zoom-in duration-700 relative z-10">
                <div className="w-full max-w-4xl text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 tracking-wider uppercase">
                        Sessão Autorizada
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
                        Painel de <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Edição</span>
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Bem-vindo de volta! Selecione a área do ecossistema que você deseja gerenciar e atualizar agora.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl">
                    <Link
                        to="/admin/blog"
                        className="group relative flex flex-col items-center text-center overflow-hidden rounded-[3rem] border bg-card/50 backdrop-blur-sm p-12 transition-all hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.1)] hover:border-primary/50 hover:-translate-y-2 ring-1 ring-border"
                    >
                        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-6 shadow-sm">
                            <BookOpen className="h-12 w-12" />
                        </div>
                        <h2 className="text-3xl font-bold group-hover:text-primary transition-colors">Conteúdo Blog</h2>
                        <p className="mt-4 text-muted-foreground leading-relaxed">
                            Artigos, insights e novidades. Gerencie todo o fluxo de conteúdo editorial do seu portal.
                        </p>
                        <div className="mt-10 flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                            ACESSAR AGORA <ArrowLeft className="h-4 w-4 rotate-180" />
                        </div>
                    </Link>

                    <Link
                        to="/admin/biblioteca"
                        className="group relative flex flex-col items-center text-center overflow-hidden rounded-[3rem] border bg-card/50 backdrop-blur-sm p-12 transition-all hover:shadow-[0_20px_50px_rgba(var(--accent-rgb),0.1)] hover:border-accent/50 hover:-translate-y-2 ring-1 ring-border"
                    >
                        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500 group-hover:-rotate-6 shadow-sm">
                            <Library className="h-12 w-12" />
                        </div>
                        <h2 className="text-3xl font-bold group-hover:text-accent transition-colors">Biblioteca</h2>
                        <p className="mt-4 text-muted-foreground leading-relaxed">
                            Frameworks, e-books e guias. Adicione valor entregando materiais exclusivos para sua audiência.
                        </p>
                        <div className="mt-10 flex items-center gap-2 text-sm font-bold text-accent opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                            ACESSAR AGORA <ArrowLeft className="h-4 w-4 rotate-180" />
                        </div>
                    </Link>

                    <Link
                        to="/admin/leads"
                        className="group relative flex flex-col items-center text-center overflow-hidden rounded-[3rem] border bg-card/50 backdrop-blur-sm p-12 transition-all hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.1)] hover:border-primary/50 hover:-translate-y-2 ring-1 ring-border"
                    >
                        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-6 shadow-sm">
                            <Users className="h-12 w-12" />
                        </div>
                        <h2 className="text-3xl font-bold group-hover:text-primary transition-colors">Leads</h2>
                        <p className="mt-4 text-muted-foreground leading-relaxed">
                            Solicitações de contato e inscrições na newsletter. Acompanhe novos interessados do site.
                        </p>
                        <div className="mt-10 flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                            ACESSAR AGORA <ArrowLeft className="h-4 w-4 rotate-180" />
                        </div>
                    </Link>
                </div>
            </section>
        </main>
    )
}
