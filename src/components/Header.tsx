import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Sobre", href: "#sobre", isRoute: false },
  { label: "Materiais", href: "/biblioteca", isRoute: true },
  { label: "Insights", href: "#insights", isRoute: false },
  { label: "Mentorias", href: "#mentorias", isRoute: false },
  { label: "Resultados", href: "#resultados", isRoute: false },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate("/" + href);
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link to="/" className="text-xl font-bold text-foreground tracking-tight">
          Guilherme<span className="text-accent">.</span>Correia
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) =>
            item.isRoute ? (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden md:block">
          <Button variant="hero" size="sm" asChild>
            <a href="#contato">Falar com Guilherme</a>
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <nav className="flex flex-col p-4 gap-3">
              {navItems.map((item) =>
                item.isRoute ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="text-sm text-muted-foreground hover:text-foreground py-2 font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-sm text-muted-foreground hover:text-foreground py-2 font-medium"
                  >
                    {item.label}
                  </a>
                )
              )}
              <Button variant="hero" size="sm" asChild className="mt-2">
                <a href="#contato">Falar com Guilherme</a>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
