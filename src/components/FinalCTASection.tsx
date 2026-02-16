import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTASection = () => {
  return (
    <section id="contato" className="py-24 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Pronto para construir crescimento{" "}
            <span className="text-accent">previsível e escalável?</span>
          </h2>
          <p className="text-lg text-primary-foreground/60 mb-10 leading-relaxed">
            Se você é empresário, CEO ou líder comercial e quer sair do improviso para uma operação 
            orientada por dados e resultados reais — essa conversa é o primeiro passo.
          </p>
          <Button
            variant="accent"
            size="lg"
            className="text-base px-10 py-6 shadow-glow"
            asChild
          >
            <a href="mailto:contato@guilhermecorreia.com">
              Conversar agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
