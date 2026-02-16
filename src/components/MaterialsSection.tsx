import { motion } from "framer-motion";
import { BookOpen, FileText, Layout, Lightbulb, Search, Presentation, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const materials = [
  {
    icon: BookOpen,
    type: "Livro",
    title: "Growth-Driven: O Framework do Crescimento Previsível",
    desc: "O método completo para transformar operações comerciais em motores de crescimento escalável.",
  },
  {
    icon: FileText,
    type: "E-book",
    title: "Guia Prático de IA Aplicada a Vendas B2B",
    desc: "Como usar inteligência artificial para prever churn, qualificar leads e escalar receita.",
  },
  {
    icon: Layout,
    type: "Framework",
    title: "Canvas de Maturidade Comercial",
    desc: "Ferramenta visual para diagnosticar o nível de estruturação da sua operação de vendas.",
  },
  {
    icon: Lightbulb,
    type: "Guia Estratégico",
    title: "Da Prospecção à Expansão: Arquitetura de Vendas Moderna",
    desc: "Guia completo sobre como estruturar cada etapa do funil para máxima previsibilidade.",
  },
  {
    icon: Search,
    type: "Pesquisa",
    title: "Panorama Growth Brasil 2025",
    desc: "Dados exclusivos sobre maturidade de growth marketing em empresas brasileiras.",
  },
  {
    icon: Presentation,
    type: "Apresentação",
    title: "Keynote: O Futuro do Marketing é Comercial",
    desc: "Slides da palestra sobre a convergência entre marketing, vendas e dados.",
  },
  {
    icon: GraduationCap,
    type: "Estudo Exclusivo",
    title: "Case: Como Triplicar Receita em 8 Meses com Growth",
    desc: "Estudo detalhado de uma operação real transformada pelo framework Growth-Driven.",
  },
];

const MaterialsSection = () => {
  return (
    <section id="materiais" className="py-24 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Biblioteca Intelectual</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mt-3 mb-4">
            Materiais & Publicações
          </h2>
          <p className="text-primary-foreground/60 text-lg">
            Livros, frameworks, pesquisas e guias estratégicos produzidos a partir de experiência real com empresas.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {materials.map((item, i) => (
            <motion.div
              key={item.title}
              className="group p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/10 transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-mono text-accent uppercase">{item.type}</span>
              </div>
              <h3 className="text-base font-bold text-primary-foreground mb-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-primary-foreground/50 leading-relaxed mb-5 flex-1">{item.desc}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-accent hover:text-accent/80 p-0 justify-start"
                asChild
              >
                <a href="#">
                  Acessar <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MaterialsSection;
