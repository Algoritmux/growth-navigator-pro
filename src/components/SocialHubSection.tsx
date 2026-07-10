import { motion } from "framer-motion";
import { Instagram, Youtube, Headphones, BookOpen, Linkedin, FileText, ArrowUpRight } from "lucide-react";

const channels = [
  { icon: Instagram, label: "Instagram", desc: "@guilherme.a.correia", href: "https://www.instagram.com/guilherme.a.correia/" },
  { icon: Youtube, label: "YouTube", desc: "Vídeos e cases reais de Growth", href: "https://www.youtube.com/@guilherme.a.correia" },
  { icon: Headphones, label: "Podcast", desc: "Conversas estratégicas sobre negócios", href: "/blog" },
  { icon: BookOpen, label: "Blog / Insights", desc: "Artigos e reflexões estratégicas", href: "/blog" },
  { icon: Linkedin, label: "Newsletter LinkedIn", desc: "Assine para insights semanais", href: "https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7281675119909912577" },
  { icon: FileText, label: "Publicações", desc: "Livros, e-books e materiais exclusivos", href: "/biblioteca" },
];

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

const SocialHubSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            ME ACOMPANHE ONDE ESTIVER
          </h2>
          <p className="text-muted-foreground text-lg">
            Siga meus conteúdos e acompanhe reflexões estratégicas sobre crescimento, marketing e negócios.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {channels.map((ch, i) => (
            <motion.a
              key={ch.label}
              href={ch.href}
              target={isExternalHref(ch.href) ? "_blank" : undefined}
              rel={isExternalHref(ch.href) ? "noopener noreferrer" : undefined}
              aria-label={`Acessar ${ch.label}`}
              className="group relative z-10 flex min-h-24 cursor-pointer items-center gap-4 rounded-2xl border border-border bg-secondary p-5 transition-all duration-300 hover:border-accent/30 hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors shrink-0">
                <ch.icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-sm">{ch.label}</div>
                <div className="text-xs text-muted-foreground">{ch.desc}</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialHubSection;
