import { motion } from "framer-motion";
import { Users, Mic, GraduationCap, ArrowRight, Rocket } from "lucide-react";
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
    desc: "Apresentações de alto impacto para eventos corporativos, convenções e equipes — sobre growth, dados, IA aplicada e estratégia comercial.",
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
          className="max-w-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Mentorias, Palestras & Consultorias</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Contrate meus serviços
          </h2>
          <p className="text-muted-foreground text-lg">
            Da absorção de conteúdo à transformação real. Escolha o formato que faz sentido para o seu momento.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {blocks.map((block, i) => (
            <motion.div
              key={block.title}
              className="group p-8 rounded-2xl bg-background border border-border hover:shadow-elevated transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-5">
                <block.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{block.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{block.desc}</p>
              <ul className="space-y-2 mb-6">
                {block.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <ContactDialog title={`Solicitar: ${block.title}`}>
                <Button
                  variant="accent"
                  size="sm"
                  className="w-full rounded-xl group/btn mt-auto text-white hover:text-white"
                >
                  Solicitar um contato <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
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
