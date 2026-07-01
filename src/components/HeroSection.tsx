import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Brain, TrendingUp } from "lucide-react";
import guilhermeHero from "@/assets/guilherme-hero.png";

const HeroSection = () => {
  return (
    <section className="hero-full-mask relative min-h-[66svh] lg:min-h-[68svh] flex items-center overflow-hidden bg-hero">
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

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-20 lg:pt-14 pb-6 lg:pb-0">
        <div className="grid lg:min-h-[calc(68svh-4rem)] lg:grid-cols-2 gap-10 items-center lg:items-stretch">
          <div className="lg:flex lg:flex-col lg:justify-center">
            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-primary-foreground leading-[1.1] mb-6 font-sans lg:text-5xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}>
              As decisões precisam ser baseadas em{" "}
              <span className="text-accent">dados</span> e{" "}
              <span className="text-accent">estratégia</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-primary-foreground/60 max-w-2xl mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}>
              Eu estruturo sistemas de crescimento e inteligência que transformam negócios e projetos em operações previsíveis.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}>
              <Button variant="accent" size="lg" className="text-base px-8 py-6 text-white hover:text-white" asChild>
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
            className="hidden lg:flex lg:self-stretch justify-center lg:justify-end relative z-20 lg:origin-bottom lg:scale-[1.06]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}>
            <div className="relative h-full w-full">
              <div className="absolute -inset-14 rounded-full bg-primary/20 blur-3xl opacity-75 pointer-events-none" />
              <div className="relative h-full w-full">
                <motion.div
                  className="absolute left-0 top-[20%] z-20 hidden h-12 w-12 -translate-x-1/2 rounded-xl border border-primary/25 bg-primary/10 backdrop-blur-sm lg:flex items-center justify-center"
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity }}>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute right-[8%] top-[10%] z-20 hidden h-11 w-11 rounded-xl border border-accent/25 bg-accent/10 backdrop-blur-sm lg:flex items-center justify-center"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4.3, repeat: Infinity, delay: 0.6 }}>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </motion.div>
                <motion.div
                  className="absolute bottom-[16%] left-[10%] z-20 hidden h-12 w-12 rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm lg:flex items-center justify-center"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4.7, repeat: Infinity, delay: 1.1 }}>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute bottom-[30%] right-0 z-20 hidden h-11 w-11 translate-x-1/2 rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm lg:flex items-center justify-center"
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.4 }}>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </motion.div>
                <div className="relative z-30 ml-auto h-full w-auto lg:translate-x-2">
                  <img
                    src={guilhermeHero}
                    alt="Guilherme Correia - Especialista em Growth Marketing"
                    className="premium-portrait h-full w-auto object-contain object-bottom"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

};

export default HeroSection;


