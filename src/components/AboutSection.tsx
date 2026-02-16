import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="sobre" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="w-full aspect-[4/5] rounded-2xl bg-gradient-primary overflow-hidden relative">
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <div className="absolute inset-0 flex items-end p-8">
                  <div className="text-primary-foreground">
                    <div className="text-6xl font-bold mb-1">23+</div>
                    <div className="text-sm text-primary-foreground/70 uppercase tracking-wider">anos de experiência</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-accent/10 flex items-center justify-center shadow-elevated">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">IA</div>
                  <div className="text-xs text-muted-foreground">aplicada</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Sobre</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Do marketing tradicional à{" "}
              <span className="text-gradient-primary">engenharia de crescimento</span>
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Há mais de duas décadas, comecei no marketing quando ele ainda era analógico. 
                Passei por agências, lideranças em empresas de médio e grande porte e construí 
                estratégias que geraram milhões em receita.
              </p>
              <p>
                Mas em algum momento percebi que o marketing sozinho não era suficiente. 
                A verdadeira alavanca de crescimento estava na <strong className="text-foreground">interseção entre 
                dados, vendas e estratégia</strong>. Foi quando migrei do marketing tradicional para 
                o <strong className="text-foreground">growth orientado a dados</strong> — integrando inteligência 
                artificial, estrutura comercial e modelagem preditiva.
              </p>
              <p>
                Hoje, minha missão é clara: transformar empresas em máquinas de crescimento 
                previsível, usando ciência de dados, automação inteligente e frameworks 
                proprietários testados em operações reais.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10">
              {[
                { value: "200+", label: "Projetos entregues" },
                { value: "R$50M+", label: "Em receita gerada" },
                { value: "15+", label: "Segmentos atendidos" },
                { value: "8x", label: "ROI médio dos projetos" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-secondary">
                  <div className="text-2xl font-bold text-primary">{item.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
