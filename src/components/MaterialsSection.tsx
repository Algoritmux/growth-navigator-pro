import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getPublishedMaterials, MATERIAL_CATEGORIES } from "@/lib/materials-store";

const MaterialsSection = () => {
  const materials = getPublishedMaterials().slice(0, 8);

  return (
    <section id="materiais" className="py-24 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Biblioteca Intelectual</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mt-3 mb-4">
            Materiais & Publicações
          </h2>
          <p className="text-primary-foreground/60 text-lg">
            Livros, frameworks, pesquisas e guias estratégicos produzidos a partir de experiência real com empresas.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {materials.map((item, i) => (
            <motion.div
              key={item.id}
              className="group p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/10 transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  {(() => {
                    const cat = MATERIAL_CATEGORIES.find((c) => c.value === item.type);
                    const Icon = cat?.icon;
                    return Icon ? <Icon className="w-5 h-5 text-accent" /> : null;
                  })()}
                </div>
                <span className="text-xs font-mono text-accent uppercase">{item.type}</span>
              </div>
              <h3 className="text-base font-bold text-primary-foreground mb-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-primary-foreground/50 leading-relaxed mb-4 flex-1">{item.desc}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/10 text-primary-foreground/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Button
                variant="accent"
                size="sm"
                className="w-full rounded-xl group/btn text-white hover:text-white"
                asChild
              >
                {item.slug ? (
                  <Link to={`/biblioteca/${item.slug}`}>
                    Acessar <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                ) : item.href && item.href !== "#" ? (
                  <a href={item.href} target="_blank" rel="noreferrer">
                    Acessar <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <span className="opacity-50">Em breve</span>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant="ghost"
            className="text-primary-foreground/40 hover:text-accent hover:bg-white/5 transition-all text-sm group"
            asChild
          >
            <Link to="/biblioteca">
              Acessar mais materiais
              <ArrowRight className="w-4 h-4 ml-2 opacity-40 group-hover:opacity-100 transition-opacity" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MaterialsSection;
