import { motion } from "framer-motion";
import guilhermeAbout from "@/assets/guilherme-about-new.jpg";
import logoGC from "@/assets/logo-gc.png";

const AboutSection = () => {
  return (
    <section id="sobre" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>

            <div className="relative">
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden relative">
                <img
                  src={guilhermeAbout}
                  alt="Guilherme - Especialista em Growth Marketing"
                  className="w-full h-full object-cover" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-end p-8">
                  <div className="text-white">
                    <div className="text-6xl font-bold mb-1">17+</div>
                    <div className="text-sm text-white/70 uppercase tracking-wider">anos de experiência</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-accent/10 flex items-center justify-center shadow-elevated">
                <img src={logoGC} alt="Logo Guilherme Correia" className="w-20 h-auto object-contain" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}>

            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Sobre</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">
              Do marketing tradicional ao{" "}
              <span className="text-gradient-primary">Growth Marketing</span>
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Há quase duas décadas, iniciei minha trajetória no marketing quando o mercado ainda era majoritariamente analógico.
                Comecei aplicando marketing nos meus próprios negócios e desenvolvendo estratégias que, ao longo do tempo, geraram milhões em receita.
              </p>
              <p>
                Com a evolução das operações, ficou claro que o marketing, isoladamente, não sustentava crescimento consistente.
                A verdadeira alavanca estava na <strong className="text-foreground">interseção entre dados, vendas e estratégia</strong>. Foi nesse momento que migrei do marketing tradicional para o <strong className="text-foreground">growth orientado a dados</strong>, integrando inteligência artificial, estrutura comercial e modelagem preditiva.
              </p>
              <p>
                Essa visão foi consolidada na prática como fundador da <strong className="text-foreground">Algoritmux</strong> e da <strong className="text-foreground">Meta de Vendas</strong>, e como cofundador da <strong className="text-foreground">Bluenote Brasil</strong>, onde aplico diariamente frameworks, automação inteligente e ciência de dados em operações reais.
              </p>
              <p>
                Hoje, minha missão é clara: transformar empresas em máquinas de crescimento previsível, conectando estratégia, tecnologia e execução para escalar resultados de forma sustentável.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10">
              {[
                { value: "200+", label: "Projetos entregues" },
                { value: "R$25M+", label: "Em receita gerada" },
                { value: "30", label: "Segmentos atendidos" },
                { value: "8x", label: "ROI médio dos projetos" }].
                map((item, i) =>
                  <div key={i} className="p-4 rounded-xl bg-secondary">
                    <div className="text-2xl font-bold text-primary">{item.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
                  </div>
                )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

};

export default AboutSection;
