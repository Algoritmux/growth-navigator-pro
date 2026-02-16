const Footer = () => {
  return (
    <footer className="py-12 bg-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <a href="#" className="text-lg font-bold text-background tracking-tight">
              Guilherme<span className="text-accent">.</span>Correia
            </a>
            <p className="text-sm text-background/40 mt-1">
              Growth Marketing · Inteligência Comercial · IA
            </p>
          </div>
          <div className="flex items-center gap-6">
            {["LinkedIn", "Instagram", "YouTube"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-sm text-background/40 hover:text-accent transition-colors"
              >
                {social}
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
