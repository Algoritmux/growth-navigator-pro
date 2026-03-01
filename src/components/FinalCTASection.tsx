import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ContactDialog } from "./ContactDialog";

const FinalCTASection = () => {
  return (
    <section id="contato" className="relative overflow-hidden border-t border-white/10 bg-hero py-24">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />

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
          <ContactDialog
            title="Vamos conversar?"
            description="Preencha seus dados abaixo e entrarei em contato para discutirmos como escalar seus resultados."
          >
            <Button
              variant="accent"
              size="lg"
              className="text-base px-10 py-6 shadow-soft rounded-xl font-bold text-white hover:text-white"
            >
              Solicitar um contato
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </ContactDialog>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
