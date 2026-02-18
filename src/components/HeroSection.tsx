import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Brain, TrendingUp } from "lucide-react";
import guilhermeHero from "@/assets/guilherme-hero.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Floating elements */}
      <motion.div
        className="absolute top-1/4 right-[15%] w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center animate-pulse-glow hidden lg:flex"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity }}>
        <BarChart3 className="w-7 h-7 text-accent" />
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 right-[25%] w-14 h-14 rounded-xl bg-primary-glow/10 flex items-center justify-center hidden lg:flex"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}>
        <Brain className="w-6 h-6 text-primary-glow" />
      </motion.div>
      <motion.div
        className="absolute top-[40%] right-[8%] w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center hidden lg:flex"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
        <TrendingUp className="w-5 h-5 text-accent" />
      </motion.div>

      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary-glow/5 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-primary-foreground leading-[1.1] mb-6 font-sans lg:text-5xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}>
              Crescimento empresarial exige{" "}
              <span className="text-accent">dados, estrutura</span> e{" "}
              <span className="text-accent">inteligência estratégica</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}>
              Integro marketing, vendas e inteligência artificial para construir operações comerciais previsíveis e escaláveis. Founder na Algoritmux e Meta de Vendas.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}>
              <Button variant="accent" size="lg" className="text-base px-8 py-6" asChild>
                <a href="#materiais">
                  Ver conteúdos e materiais
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button
                variant="hero-outline"
                size="lg"
                className="text-base px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild>
                <a href="#mentorias">Mentorias e palestras</a>
              </Button>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            className="hidden lg:flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-accent/10 blur-2xl" />
              <img
                src={guilhermeHero}
                alt="Guilherme Correia — Especialista em Growth Marketing"
                className="relative rounded-2xl w-[400px] object-cover shadow-2xl border border-border/20"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
