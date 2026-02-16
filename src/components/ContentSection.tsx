import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, BarChart3, Handshake, Lightbulb } from "lucide-react";

const categories = [
  { icon: BarChart3, label: "Growth Marketing", count: 12 },
  { icon: Brain, label: "IA aplicada aos negócios", count: 8 },
  { icon: Lightbulb, label: "Estratégia Comercial", count: 10 },
  { icon: Handshake, label: "Negociação", count: 6 },
  { icon: BookOpen, label: "Liderança e Gestão", count: 9 },
  { icon: BookOpen, label: "Reflexões Estratégicas", count: 7 },
];

const featuredArticles = [
  {
    category: "Growth Marketing",
    title: "Por que 90% das estratégias de growth falham — e como evitar os mesmos erros",
    excerpt: "O growth marketing vai além de hacks isolados. Entenda o framework que conecta dados, execução e resultado.",
    readTime: "8 min",
  },
  {
    category: "IA aplicada",
    title: "Como usar IA para prever churn e aumentar retenção em 40%",
    excerpt: "Modelos preditivos aplicados a bases reais de clientes para antecipar cancelamentos e agir proativamente.",
    readTime: "6 min",
  },
  {
    category: "Inteligência Comercial",
    title: "O funil não morreu — ele evoluiu. A nova arquitetura de vendas B2B",
    excerpt: "Da prospecção à expansão de conta: como estruturar uma operação comercial orientada por dados.",
    readTime: "10 min",
  },
];

const ContentSection = () => {
  return (
    <section id="insights" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="max-w-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Blog & Insights</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Hub de conhecimento estratégico
          </h2>
          <p className="text-muted-foreground text-lg">
            Artigos estratégicos sobre crescimento, dados e inteligência aplicada a negócios.
          </p>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
              <span className="text-xs text-muted-foreground ml-1">({cat.count})</span>
            </motion.button>
          ))}
        </div>

        {/* Featured Articles */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredArticles.map((article, i) => (
            <motion.article
              key={i}
              className="group p-6 rounded-2xl bg-card border border-border hover:shadow-elevated transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">{article.category}</span>
              <h3 className="text-lg font-bold text-foreground mt-3 mb-3 group-hover:text-primary transition-colors leading-snug">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{article.readTime} de leitura</span>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;
