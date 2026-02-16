import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Ricardo Mendes",
    role: "CEO, TechScale Brasil",
    text: "Guilherme transformou nossa operação comercial. Saímos de vendas reativas para um pipeline previsível com crescimento de 3x em 8 meses.",
  },
  {
    name: "Ana Paula Torres",
    role: "Diretora Comercial, IndusTech",
    text: "A clareza estratégica que ele trouxe foi fundamental. Hoje temos dashboards, processos e uma cultura de dados que não existia antes.",
  },
  {
    name: "Marcos Silva",
    role: "Fundador, SaaS Metrics",
    text: "O diagnóstico revelou gargalos que tentávamos resolver há anos. A metodologia é precisa, prática e orientada a resultado real.",
  },
];

const metrics = [
  { value: "3.2x", label: "Crescimento médio de receita" },
  { value: "47%", label: "Redução média no CAC" },
  { value: "89%", label: "Dos clientes renovam contrato" },
  { value: "60+", label: "Empresas transformadas" },
];

const SocialProofSection = () => {
  return (
    <section id="resultados" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Resultados</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Resultados que falam por si
          </h2>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              className="text-center p-6 rounded-2xl bg-secondary"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">{metric.value}</div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-2xl bg-card border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Quote className="w-8 h-8 text-accent/30 mb-4" />
              <p className="text-foreground leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
