import { motion } from "framer-motion";
import { Users, Mic, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "./ContactDialog";

const blocks = [
  {
    icon: Users,
    title: "Mentoria Executiva",
    desc: "Acompanhamento estratégico contínuo para CEOs, diretores e líderes comerciais que precisam de clareza, direção e accountability para escalar resultados.",
    features: ["Sessões individuais", "Plano estratégico personalizado", "Acompanhamento de KPIs", "Acesso direto ao mentor"],
  },
  {
    icon: Mic,
    title: "Palestras e Treinamentos",
    desc: "Apresentações de alto impacto para eventos corporativos, convenções e equipes sobre growth, dados, IA aplicada e estratégia comercial.",
    features: ["Conteúdo customizado", "Formatos presencial e online", "Material de apoio exclusivo", "Workshops práticos"],
  },
  {
    icon: Rocket,
    title: "Consultoria de GTM (Go-To-Market)",
    desc: "Estratégia e execução de Go-To-Market para empresas que querem lançar, reposicionar ou escalar produtos e serviços com previsibilidade, alinhando marketing, vendas e operação a partir de dados.",
    features: ["Diagnóstico completo de mercado", "Estratégia de aquisição, canais e pricing", "Alinhamento entre marketing, vendas e produto", "Acompanhamento estratégico e plano de execução"],
  },
];

const MentorshipSection = () => {
  return (
    <section id="mentorias" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">Mentorias, Palestras & Consultorias</span>
          <h2 className="mt-3 mb-4 text-3xl font-bold text-foreground sm:text-4xl">{"Contrate meus servi\u00e7os"}</h2>
          <p className="text-lg text-muted-foreground">
            {"Da aquisi\u00e7\u00e3o de conte\u00fado \u00e0 transforma\u00e7\u00e3o real. Escolha o formato que faz sentido para o momento do seu neg\u00f3cio."}
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {blocks.map((block, i) => (
            <motion.div
              key={block.title}
              className="group flex flex-col rounded-2xl border border-border bg-background p-8 transition-all duration-300 hover:shadow-elevated"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                <block.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{block.title}</h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">{block.desc}</p>
              <ul className="mb-6 space-y-2">
                {block.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <ContactDialog title={`Solicitar: ${block.title}`}>
                <Button
                  variant="accent"
                  size="sm"
                  className="group/btn mt-auto w-full rounded-xl text-white hover:text-white"
                >
                  Solicitar um contato <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </ContactDialog>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorshipSection;
