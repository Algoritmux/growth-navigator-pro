import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Brain, TrendingUp } from "lucide-react";
import guilhermeHero from "@/assets/guilherme-hero.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Floating elements */}
      <motion.div
        className="absolute top-1/4 right-[15%] w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse-glow hidden lg:flex border border-primary/20 backdrop-blur-sm"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity }}>
        <BarChart3 className="w-7 h-7 text-primary" />
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 right-[25%] w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center hidden lg:flex border border-accent/20 backdrop-blur-sm"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}>
        <Brain className="w-6 h-6 text-accent" />
      </motion.div>
      <motion.div
        className="absolute top-[40%] right-[8%] w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center hidden lg:flex border border-primary/20 backdrop-blur-sm"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
        <TrendingUp className="w-5 h-5 text-primary" />
      </motion.div>

      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-primary-foreground leading-[1.1] mb-6 font-sans lg:text-5xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}>
              Growth Marketing focado em{" "}
              <span className="text-accent">dados</span> e{" "}
              <span className="text-accent">inteligência estratégica</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-primary-foreground/60 max-w-2xl mb-10 leading-relaxed"
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
              <Button variant="accent" size="lg" className="text-base px-8 py-6 text-primary hover:text-primary" asChild>
                <a href="#materiais">
                  Ver conteúdos e materiais
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 border-white/20 text-white hover:bg-white/10 hover:text-white transition-all bg-transparent"
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
              <div className="absolute -inset-12 rounded-full bg-primary/20 blur-3xl opacity-60 pointer-events-none" />
              <div className="relative w-[430px] xl:w-[460px]">
                <div className="pointer-events-none absolute -bottom-6 left-1/2 z-0 h-10 w-[80%] -translate-x-1/2 rounded-full bg-black/80 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-2 left-1/2 z-[1] h-5 w-[64%] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <img
                  src={guilhermeHero}
                  alt="Guilherme Correia - Especialista em Growth Marketing"
                  className="relative z-30 w-full h-auto object-contain drop-shadow-[0_24px_52px_rgba(0,0,0,0.55)]"
                />
                <div
                  className="pointer-events-none absolute inset-0 z-20"
                  style={{
                    background:
                      "radial-gradient(122% 96% at 50% 34%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.08) 90%, rgba(0,0,0,0.16) 100%), linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 86%, rgba(0,0,0,0.1) 100%), linear-gradient(180deg, rgba(0,0,0,0) 74%, rgba(0,0,0,0.12) 100%)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

};

export default HeroSection;

