import { motion } from "framer-motion";
import { Database, Layers, Rocket, Target, TrendingUp, Package, Award, Globe } from "lucide-react";

const steps = [
  { icon: Database, title: "Dados", desc: "Mapeamento completo de indicadores, fontes de dados e métricas que importam para decisões estratégicas." },
  { icon: Layers, title: "Modelagem", desc: "Construção de modelos preditivos e frameworks de análise para antecipar cenários e oportunidades." },
  { icon: Rocket, title: "Execução", desc: "Implementação ágil com sprints focados em alavancas de maior impacto no crescimento." },
  { icon: Target, title: "Resultado", desc: "Mensuração precisa de cada ação, otimização contínua e accountability sobre metas reais." },
  { icon: TrendingUp, title: "Escala", desc: "Sistematização dos processos que funcionam para crescer sem aumentar custos proporcionalmente." },
  { icon: Package, title: "Produto", desc: "Refinamento da oferta comercial com base em dados de mercado e comportamento do cliente." },
  { icon: Award, title: "Reputação", desc: "Construção de autoridade e posicionamento que atrai clientes de maior valor e reduz CAC." },
  { icon: Globe, title: "Expansão", desc: "Abertura de novos mercados, canais e segmentos com estrutura e previsibilidade." },
];

const MethodologySection = () => {
  return (
    <section id="metodologia" className="py-24 bg-hero relative overflow-hidden">
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
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Metodologia Proprietária</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mt-3 mb-4">
            Framework Growth-Driven
          </h2>
          <p className="text-primary-foreground/60 text-lg">
            8 etapas interconectadas que transformam operações comerciais em sistemas de crescimento previsível e escalável.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="group p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/10 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-mono text-primary-foreground/40">0{i + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-primary-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-primary-foreground/50 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;
