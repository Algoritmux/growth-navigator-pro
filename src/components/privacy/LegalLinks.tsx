import { Link, useLocation } from "react-router-dom";
import CookiePreferencesButton from "./CookiePreferencesButton";

/** Páginas que já têm o rodapé completo (Footer.tsx) ou são internas. */
function hasOwnFooterOrIsInternal(pathname: string) {
  return pathname === "/" || pathname === "/servicos" || pathname === "/login" || pathname.startsWith("/admin");
}

/**
 * Linha discreta no fim das páginas públicas sem rodapé (blog, posts,
 * biblioteca, materiais, privacidade), para a política e as preferências de
 * cookies estarem sempre a um clique.
 */
export default function LegalLinks() {
  const { pathname } = useLocation();
  if (hasOwnFooterOrIsInternal(pathname)) return null;

  const linkClass = "hover:text-foreground underline-offset-4 hover:underline";

  return (
    <nav
      aria-label="Privacidade"
      className="border-t border-border bg-background px-4 py-6 text-center text-xs text-muted-foreground"
    >
      <Link to="/privacidade" className={linkClass}>
        Política de Privacidade
      </Link>
      <span className="mx-3" aria-hidden="true">
        ·
      </span>
      <CookiePreferencesButton className={linkClass} />
    </nav>
  );
}
