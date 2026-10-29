import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OPEN_CONSENT_EVENT, readConsent, saveConsent, type ConsentState } from "@/lib/consent";

/** Painel e login são de uso interno: o aviso não aparece ali. */
function isInternalRoute(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/admin");
}

/**
 * Aviso de cookies. Segue o guia da ANPD: nada ativado por padrão, "Recusar"
 * com o mesmo tamanho e destaque de "Aceitar", link para a política e
 * possibilidade de mudar a escolha depois (link "Preferências de cookies").
 */
export default function ConsentBanner() {
  const { pathname } = useLocation();
  const [current, setCurrent] = useState<ConsentState | null>(() => readConsent());
  const [open, setOpen] = useState(() => readConsent() === null);

  useEffect(() => {
    const reopen = () => {
      setCurrent(readConsent());
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open || isInternalRoute(pathname)) return null;

  const choose = (analytics: boolean) => {
    setCurrent(saveConsent(analytics));
    setOpen(false);
  };

  const buttonClass = "h-11 min-w-[132px] flex-1 sm:flex-none rounded-xl font-semibold";

  return (
    <section
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-background p-5 text-foreground shadow-2xl sm:p-6">
        <h2 className="text-base font-bold">Cookies e privacidade</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Usamos cookies do Google Analytics para entender como o site é usado e melhorar os conteúdos.
          Eles só são ativados se você aceitar. O site e os formulários funcionam normalmente se você
          recusar. Saiba mais na{" "}
          <Link to="/privacidade" className="font-medium text-foreground underline underline-offset-4">
            Política de Privacidade
          </Link>
          .
        </p>
        {current && (
          <p className="mt-2 text-xs text-muted-foreground" data-testid="consent-current">
            Sua escolha atual: cookies analíticos {current.analytics ? "aceitos" : "recusados"}.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="outline" className={buttonClass} onClick={() => choose(false)}>
            Recusar
          </Button>
          <Button type="button" variant="outline" className={buttonClass} onClick={() => choose(true)}>
            Aceitar
          </Button>
          {current && (
            <Button type="button" variant="ghost" className="h-11 rounded-xl" onClick={() => setOpen(false)}>
              Manter escolha
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
