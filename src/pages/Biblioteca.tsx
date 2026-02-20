import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen, FileText, Layout, Lightbulb, Search,
  Presentation, GraduationCap, ArrowRight, ArrowLeft,
  BarChart3, Brain, Handshake, Filter
} from "lucide-react";
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

const categories = [
  { icon: BookOpen, label: "Todos", value: "all" },
  { icon: BookOpen, label: "Livros", value: "Livro" },
  { icon: FileText, label: "E-books", value: "E-book" },
  { icon: Layout, label: "Frameworks", value: "Framework" },
  { icon: Lightbulb, label: "Guias Estratégicos", value: "Guia Estratégico" },
  { icon: Search, label: "Pesquisas", value: "Pesquisa" },
  { icon: Presentation, label: "Apresentações", value: "Apresentação" },
  { icon: GraduationCap, label: "Estudos Exclusivos", value: "Estudo Exclusivo" },
];

const allMaterials = [
  {
    icon: BookOpen,
    type: "Livro",
    title: "Growth-Driven: O Framework do Crescimento Previsível",
    desc: "O método completo para transformar operações comerciais em motores de crescimento escalável.",
    tags: ["Growth Marketing", "Estratégia"],
  },
  {
    icon: FileText,
    type: "E-book",
    title: "Guia Prático de IA Aplicada a Vendas B2B",
    desc: "Como usar inteligência artificial para prever churn, qualificar leads e escalar receita.",
    tags: ["IA", "Vendas B2B"],
  },
  {
    icon: Layout,
    type: "Framework",
    title: "Canvas de Maturidade Comercial",
    desc: "Ferramenta visual para diagnosticar o nível de estruturação da sua operação de vendas.",
    tags: ["Estratégia Comercial"],
  },
  {
    icon: Lightbulb,
    type: "Guia Estratégico",
    title: "Da Prospecção à Expansão: Arquitetura de Vendas Moderna",
    desc: "Guia completo sobre como estruturar cada etapa do funil para máxima previsibilidade.",
    tags: ["Vendas", "Growth"],
  },
  {
    icon: Search,
    type: "Pesquisa",
    title: "Panorama Growth Brasil 2025",
    desc: "Dados exclusivos sobre maturidade de growth marketing em empresas brasileiras.",
    tags: ["Growth Marketing", "Dados"],
  },
  {
    icon: Presentation,
    type: "Apresentação",
    title: "Keynote: O Futuro do Marketing é Comercial",
    desc: "Slides da palestra sobre a convergência entre marketing, vendas e dados.",
    tags: ["Marketing", "Vendas"],
  },
  {
    icon: GraduationCap,
    type: "Estudo Exclusivo",
    title: "Case: Como Triplicar Receita em 8 Meses com Growth",
    desc: "Estudo detalhado de uma operação real transformada pelo framework Growth-Driven.",
    tags: ["Growth", "Case"],
  },
  {
    icon: FileText,
    type: "E-book",
    title: "Playbook de Prospecção Outbound B2B",
    desc: "Passo a passo para montar uma máquina de prospecção ativa que gera reuniões qualificadas.",
    tags: ["Vendas B2B", "Prospecção"],
  },
  {
    icon: Lightbulb,
    type: "Guia Estratégico",
    title: "Como Construir um Time Comercial de Alta Performance",
    desc: "Frameworks de contratação, onboarding e gestão de equipes de vendas orientadas a resultado.",
    tags: ["Liderança", "Gestão"],
  },
  {
    icon: Layout,
    type: "Framework",
    title: "Modelo de Forecast Preditivo",
    desc: "Template para criar previsões de vendas baseadas em dados reais e taxas de conversão históricas.",
    tags: ["Dados", "Vendas"],
  },
  {
    icon: Search,
    type: "Pesquisa",
    title: "Estado da IA nas Vendas B2B — Brasil 2025",
    desc: "Pesquisa sobre adoção de inteligência artificial em times de vendas brasileiros.",
    tags: ["IA", "Vendas B2B"],
  },
  {
    icon: GraduationCap,
    type: "Estudo Exclusivo",
    title: "Case: Redução de 60% no CAC com Inbound Estruturado",
    desc: "Como uma empresa SaaS reduziu o custo de aquisição redesenhando sua estratégia de conteúdo.",
    tags: ["Marketing", "Case"],
  },
];

function BibliotecaSidebar({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (val: string) => void;
}) {
  return (
    <Sidebar className="border-r border-border bg-card pt-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Categorias
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((cat) => {
                const isActive = activeCategory === cat.value;
                const count =
                  cat.value === "all"
                    ? allMaterials.length
                    : allMaterials.filter((m) => m.type === cat.value).length;
                return (
                  <SidebarMenuItem key={cat.value}>
                    <SidebarMenuButton
                      onClick={() => onCategoryChange(cat.value)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <cat.icon className="mr-2 h-4 w-4" />
                      <span className="flex-1">{cat.label}</span>
                      <span className="text-xs text-muted-foreground">({count})</span>
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

const Biblioteca = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return allMaterials.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.type === activeCategory;
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const activeCategoryLabel =
    categories.find((c) => c.value === activeCategory)?.label || "Todos";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <BibliotecaSidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <main className="flex-1 pt-16">
          {/* Top bar */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
            <div className="flex items-center justify-between h-16 px-4 lg:px-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-foreground" />
                <Link
                  to="/"
                  className="text-xl font-bold text-foreground tracking-tight"
                >
                  Guilherme<span className="text-accent">.</span>Correia
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
            {filtered.length === 0 ? (
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
                    key={item.title}
                    className="group p-6 rounded-2xl bg-card border border-border hover:shadow-elevated transition-all duration-300 flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
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
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 p-0 justify-start"
                      asChild
                    >
                      <a href="#">
                        Acessar <ArrowRight className="w-4 h-4 ml-1" />
                      </a>
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
};

export default Biblioteca;
