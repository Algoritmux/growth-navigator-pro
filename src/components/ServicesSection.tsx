import { motion } from "framer-motion";
import { Search, Users, Rocket, Database, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Search,
    level: "Nível 1",
    title: "Diagnóstico Estratégico",
    when: "Quando sua empresa precisa de clareza sobre onde estão os gargalos de crescimento.",
    transform: "Mapa completo da operação com prioridades claras, indicadores e plano de ação imediato.",
  },
  {
    icon: Users,
    level: "Nível 2",
    title: "Mentoria Executiva",
    when: "Quando a liderança precisa de direcionamento estratégico contínuo para escalar.",
    transform: "Tomada de decisão mais rápida, cultura data-driven e alinhamento entre marketing e vendas.",
  },
  {
    icon: Rocket,
    level: "Nível 3",
    title: "Implantação Growth",
    when: "Quando é hora de implementar o framework completo de crescimento previsível.",
    transform: "Operação de growth funcionando com processos, dashboards e rotinas de otimização contínua.",
  },
  {
    icon: Database,
    level: "Nível 4",
    title: "Inteligência Comercial",
    when: "Quando a empresa precisa de vendas previsíveis baseadas em dados e IA.",
    transform: "Pipeline estruturado, scoring inteligente, automação e previsibilidade de receita mensal.",
  },
];

const ServicesSection = () => {
  return (
    <section id="servicos" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="max-w-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Serviços</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Jornada de maturidade empresarial
          </h2>
          <p className="text-muted-foreground text-lg">
            Cada empresa está em um estágio diferente. Os serviços são organizados por nível de maturidade — não como pacotes genéricos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              className="group p-8 rounded-2xl bg-background border border-border hover:shadow-elevated transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-mono text-accent">{service.level}</span>
                  <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quando contratar</span>
                  <p className="text-sm text-muted-foreground mt-1">{service.when}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">Transformação</span>
                  <p className="text-sm text-foreground mt-1 font-medium">{service.transform}</p>
                </div>
              </div>
              <Button
                variant="accent"
                size="sm"
                className="w-full rounded-xl group/btn text-white hover:text-white"
                asChild
              >
                <Link to="/servicos">
                  Saber mais <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
