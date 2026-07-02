import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Filter, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import {
    MATERIAL_CATEGORIES,
    fetchMaterialsFromApi,
    type MaterialItem,
    MaterialCategoryValue,
} from "@/lib/materials-store";
import logoGC from "@/assets/logo-gc.png";

function BibliotecaSidebar({
    activeCategory,
    onCategoryChange,
    items,
}: {
    activeCategory: MaterialCategoryValue;
    onCategoryChange: (val: MaterialCategoryValue) => void;
    items: MaterialItem[];
}) {
    function countMaterialsByCategory(value: MaterialCategoryValue) {
        if (value === "all") return items.length;
        return items.filter((item) => item.type === value).length;
    }

    return (
        <Sidebar className="border-r border-border bg-card pt-16">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Categorias
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {MATERIAL_CATEGORIES.map((cat) => {
                                const isActive = activeCategory === cat.value;
                                const count = countMaterialsByCategory(cat.value);

                                return (
                                    <SidebarMenuItem key={cat.value}>
                                        <SidebarMenuButton
                                            onClick={() => onCategoryChange(cat.value)}
                                            className={`cursor-pointer transition-colors ${isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-muted-foreground hover:bg-muted"
                                                }`}
                                        >
                                            <cat.icon className="mr-2 h-4 w-4" />
                                            <span className="flex-1">{cat.label}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({count})
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

export default function Biblioteca() {
    const [items, setItems] = useState<MaterialItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] =
        useState<MaterialCategoryValue>("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        let active = true;

        fetchMaterialsFromApi(true)
            .then((data) => {
                if (active) setItems(data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        return items.filter((item) => {
            const matchesCategory = activeCategory === "all" || item.type === activeCategory;

            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.desc.toLowerCase().includes(q) ||
                item.tags.some((t) => t.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, items, searchQuery]);

    const activeCategoryLabel =
        MATERIAL_CATEGORIES.find((c) => c.value === activeCategory)?.label || "Todos";

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <BibliotecaSidebar
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    items={items}
                />

                <main className="flex-1 pt-16">
                    {/* Top bar */}
                    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
                        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
                            <div className="flex items-center gap-3">
                                <SidebarTrigger className="text-foreground" />
                                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground tracking-tight group">
                                    <img src={logoGC} alt="Logo" className="h-8 w-auto object-contain" />
                                    <span>Guilherme<span className="text-accent">.</span>Correia</span>
                                </Link>
                            </div>

                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar ao site
                                </Link>
                            </Button>
                        </div>
                    </header>

                    <div className="container mx-auto px-4 lg:px-8 py-10">
                        {/* Page header */}
                        <motion.div
                            className="mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                                Biblioteca Intelectual
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-3">
                                Materiais & Publicações
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                Livros, frameworks, pesquisas e guias estratégicos produzidos a
                                partir de experiência real com empresas.
                            </p>
                        </motion.div>

                        {/* Search & filter bar */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 mb-8"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por título, tema ou tag..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Filter className="w-4 h-4" />
                                <span>
                                    {activeCategoryLabel} · {filtered.length}{" "}
                                    {filtered.length === 1 ? "material" : "materiais"}
                                </span>
                            </div>
                        </motion.div>

                        {/* Grid */}
                        {isLoading ? (
                            <div className="text-center py-20">
                                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground text-lg">
                                    Carregando materiais...
                                </p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground text-lg">
                                    Nenhum material encontrado.
                                </p>
                                <p className="text-muted-foreground/60 text-sm mt-1">
                                    Tente outra busca ou categoria.
                                </p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filtered.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        className="group p-6 rounded-2xl bg-card border border-border hover:shadow-elevated transition-all duration-300 flex flex-col"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.04 }}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                {(() => {
                                                    const cat = MATERIAL_CATEGORIES.find((c) => c.value === item.type);
                                                    const Icon = cat?.icon;
                                                    return Icon ? <Icon className="w-5 h-5 text-primary" /> : null;
                                                })()}
                                            </div>

                                            <span className="text-xs font-mono text-accent uppercase">
                                                {item.type}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold text-foreground mb-2 leading-snug">
                                            {item.title}
                                        </h3>

                                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                                            {item.desc}
                                        </p>

                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {item.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <Button
                                            variant="accent"
                                            size="sm"
                                            className="w-full rounded-xl group/btn text-white hover:text-white"
                                            asChild
                                        >
                                            {item.slug ? (
                                                <Link to={`/biblioteca/${item.slug}`}>
                                                    Acessar <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            ) : item.href && item.href !== "#" ? (
                                                <a href={item.href} target="_blank" rel="noreferrer">
                                                    Acessar <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                                </a>
                                            ) : (
                                                <span className="opacity-50">Em breve</span>
                                            )}
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
