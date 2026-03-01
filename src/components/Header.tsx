import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoGC from "@/assets/logo-gc.png";

const navItems = [
  { label: "Sobre", href: "#sobre", isRoute: false },
  { label: "Materiais", href: "#materiais", isRoute: false },
  { label: "Insights", href: "#insights", isRoute: false },
  { label: "Mentorias", href: "#mentorias", isRoute: false },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg transition-all duration-300 ${
        isScrolled
          ? "bg-zinc-900/65 shadow-[0_10px_35px_rgba(0,0,0,0.25)]"
          : "bg-zinc-800/45"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-foreground tracking-tight group">
          <img src={logoGC} alt="Logo" className="h-8 w-auto object-contain brightness-100" />
          <span>Guilherme<span className="text-accent">.</span>Correia</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) =>
            item.isRoute ? (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-medium"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden md:block">
          <Button variant="default" size="sm" asChild className="bg-[#8A10AF] hover:bg-[#8A10AF]/90 text-white shadow-soft transition-all duration-300 font-semibold px-6">
            <a href="#contato">Falar com Guilherme</a>
          </Button>
        </div>

        <button className="md:hidden text-primary-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden ${isScrolled ? "bg-zinc-900/85" : "bg-zinc-900/70"}`}
          >
            <nav className="flex flex-col p-4 gap-3">
              {navItems.map((item) =>
                item.isRoute ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground py-2 font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground py-2 font-medium"
                  >
                    {item.label}
                  </a>
                )
              )}
              <Button variant="default" size="sm" asChild className="mt-2 bg-[#8A10AF] hover:bg-[#8A10AF]/90 text-white font-semibold">
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
