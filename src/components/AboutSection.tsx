import { motion } from "framer-motion";
import guilhermeAbout from "@/assets/guilherme-about-new.jpg";
import logoGC from "@/assets/logo-gc.png";

const AboutSection = () => {
  return (
    <section id="sobre" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                <img
                  src={guilhermeAbout}
                  alt="Guilherme - Especialista em Growth Marketing"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-end p-8">
                  <div className="text-white">
                    <div className="mb-1 text-6xl font-bold">17+</div>
                    <div className="text-sm uppercase tracking-wider text-white/70">anos de experiência</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 flex h-32 w-32 items-center justify-center rounded-2xl bg-accent/10 shadow-elevated">
                <img src={logoGC} alt="Logo Guilherme Correia" className="h-auto w-20 object-contain" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">Sobre</span>
            <h2 className="mt-3 mb-6 text-3xl font-bold text-foreground sm:text-4xl">
              Do marketing tradicional ao{" "}
              <span className="text-gradient-primary">Growth Marketing</span>
            </h2>

            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>
                Há quase duas décadas, iniciei minha trajetória no marketing, em um cenário ainda predominantemente analógico. As estratégias funcionavam,
                campanhas geravam resultado e os negócios cresciam. No entanto, com o tempo, ficou evidente um problema central: o crescimento não era previsível,
                pois dependia de esforços constantes e desconectados.
              </p>
              <p>
                Essa limitação deixou claro que o marketing tradicional, isoladamente, não sustenta um crescimento consistente. Faltavam estrutura, integração e uma lógica
                que conectasse as ações ao longo do tempo. Foi a partir dessa percepção que comecei a migrar para uma abordagem mais orientada a crescimento,
                baseada na integração de três pilares: <strong className="text-foreground">dados, estratégia e tecnologia</strong>.
              </p>
              <p>
                Essa transição marca o que hoje se consolida como <strong className="text-foreground">Growth Marketing</strong>: uma abordagem que conecta áreas,
                utiliza dados para orientar decisões e estrutura o crescimento como um processo contínuo, e não como ações isoladas. A partir dessa lógica,
                o crescimento deixou de ser baseado em tentativa e erro e passou a ser conduzido por análise, modelagem e inteligência aplicada.
              </p>
              <p>
                Esse movimento foi consolidado na prática como fundador da <strong className="text-foreground">Algoritmux</strong> e da <strong className="text-foreground">Meta de Vendas</strong>,
                e como cofundador da <strong className="text-foreground">Bluenote Brasil</strong>. Hoje, minha atuação é direcionada à estruturação de sistemas de crescimento previsível,
                conectando estratégia, tecnologia e execução para transformar aquisição em processo, dados em decisão e crescimento em algo previsível e sustentável.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { value: "200+", label: "Projetos entregues" },
                { value: "R$50M+", label: "em receita gerada" },
                { value: "30", label: "Segmentos atendidos" },
                { value: "8x", label: "ROI médio dos projetos" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-secondary p-4">
                  <div className="text-2xl font-bold text-primary">{item.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
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
