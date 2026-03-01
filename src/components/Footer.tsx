import logoGC from "@/assets/logo-gc.png";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <a href="#" className="flex items-center gap-2 text-lg font-bold text-background tracking-tight group">
              <img src={logoGC} alt="Logo" className="h-7 w-auto object-contain" />
              <span>Guilherme<span className="text-accent">.</span>Correia</span>
            </a>
            <p className="text-sm text-background/40 mt-1 text-center md:text-left">
              Growth Marketing · Inteligência Comercial · IA
            </p>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "LinkedIn", href: "https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7281675119909912577" },
              { label: "Instagram", href: "https://www.instagram.com/guilherme.a.correia/" },
              { label: "YouTube", href: "https://www.youtube.com/@guilherme.a.correia" }
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/40 hover:text-accent transition-colors"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-background/10 text-center">
          <p className="text-xs text-background/30">
            © {new Date().getFullYear()} Guilherme Correia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
