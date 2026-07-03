import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, LogOut, BookOpen, Library, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminHeader() {
    const location = useLocation();
    const isBlog = location.pathname.includes("/admin/blog");
    const isLibrary = location.pathname.includes("/admin/biblioteca");
    const isLeads = location.pathname.includes("/admin/leads");

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Site</span>
                        </Link>
                    </Button>
                    <div className="h-4 w-[1px] bg-border"></div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin" className="gap-2 text-muted-foreground hover:text-foreground">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Painel</span>
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-1 rounded-lg border bg-background/50 p-1">
                        <Link
                            to="/admin/blog"
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${isBlog ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            Blog
                        </Link>
                        <Link
                            to="/admin/biblioteca"
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${isLibrary ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            <Library className="h-3.5 w-3.5" />
                            Biblioteca
                        </Link>
                        <Link
                            to="/admin/leads"
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${isLeads ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            <Users className="h-3.5 w-3.5" />
                            Leads
                        </Link>
                    </nav>

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
                        <LogOut className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Sair</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
