import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 mb-6">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Sua empresa investe em marketing, mas{" "}
            <span className="text-gradient-primary">não cresce de forma previsível?</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            A maioria das empresas gasta em tráfego pago, redes sociais e conteúdo — 
            mas sem estrutura comercial, processos claros e inteligência de dados, 
            cada real investido é um tiro no escuro. O problema não é falta de marketing. 
            É falta de <strong className="text-foreground">arquitetura de crescimento</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { number: "73%", label: "das empresas não sabem seu CAC real" },
              { number: "68%", label: "não possuem funil comercial estruturado" },
              { number: "85%", label: "operam sem previsibilidade de receita" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl bg-background shadow-soft"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
