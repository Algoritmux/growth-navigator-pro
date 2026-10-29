/**
 * Eventos de conversão no GA4 (G-8PJTEYT1PV, carregado no index.html) e
 * atribuição do lead à página onde ele converteu e à página de entrada.
 *
 * Nada aqui pode quebrar a página: sem gtag, sem sessionStorage ou com
 * qualquer erro, as funções simplesmente não registram.
 */

type EventParams = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const ATTRIBUTION_KEY = "gc_attribution";
const SOURCE_MAX_LENGTH = 120; // leads.source e newsletter_subscribers.source
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"];

export type Attribution = {
  /** Primeira página vista na sessão, com UTMs quando houver. */
  landing: string;
  /** Domínio de onde a pessoa veio (ex.: www.google.com); vazio = acesso direto. */
  referrer: string;
};

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") clean[key] = value;
  }

  try {
    window.gtag("event", name, clean);
  } catch {
    // Analytics nunca interrompe a navegação.
  }
}

export function currentPath(): string {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

function landingFromLocation(location: Pick<Location, "pathname" | "search">): string {
  const params = new URLSearchParams(location.search);
  const utms = UTM_KEYS.filter((key) => params.get(key)).map((key) => `${key}=${params.get(key)}`);
  return utms.length > 0 ? `${location.pathname}?${utms.join("&")}` : location.pathname;
}

function externalReferrerHost(referrer: string, ownHost: string): string {
  if (!referrer) return "";
  try {
    const host = new URL(referrer).hostname;
    return host && host !== ownHost ? host : "";
  } catch {
    return "";
  }
}

/** Grava a página de entrada e a origem uma única vez por sessão. */
export function captureAttribution(
  location: Pick<Location, "pathname" | "search" | "hostname"> = window.location,
  referrer: string = document.referrer,
): Attribution {
  const fresh: Attribution = {
    landing: landingFromLocation(location),
    referrer: externalReferrerHost(referrer, location.hostname),
  };

  try {
    const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(fresh));
  } catch {
    // sessionStorage bloqueado (aba anônima, cookies desligados).
  }

  return fresh;
}

export function getAttribution(): Attribution {
  try {
    const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {
    // Sem armazenamento: usa a página atual.
  }
  return { landing: currentPath(), referrer: "" };
}

/**
 * Origem gravada no lead, ex.: "contact-dialog | pág /servicos | entrada /blog/icp | ref www.google.com".
 * Cabe em 120 caracteres: partes que não cabem são omitidas, a origem base nunca.
 */
export function buildLeadSource(
  base: string,
  page: string,
  attribution: Attribution,
  maxLength = SOURCE_MAX_LENGTH,
): string {
  let source = (base || "site").slice(0, maxLength);
  const extras = [`pág ${page}`];
  if (attribution.landing && attribution.landing !== page) extras.push(`entrada ${attribution.landing}`);
  if (attribution.referrer) extras.push(`ref ${attribution.referrer}`);

  for (const extra of extras) {
    const candidate = `${source} | ${extra}`;
    if (candidate.length <= maxLength) source = candidate;
  }

  return source;
}

/** Parâmetros comuns aos eventos de lead. */
export function leadEventParams(base: string): EventParams {
  const attribution = getAttribution();
  return {
    lead_source: base,
    page_path: currentPath(),
    landing_page: attribution.landing,
    referrer_host: attribution.referrer || "direto",
  };
}

type LinkEvent = { name: string; params: EventParams };

/** Decide qual evento um link dispara; null = não rastrear (cliques comuns ficam com o GA4). */
export function classifyLink(href: string): LinkEvent | null {
  const value = href.trim();
  let url: URL;
  try {
    url = new URL(value, "https://guilhermecorreia.com.br");
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "wa.me" || host === "api.whatsapp.com") {
    const phone = host === "wa.me" ? url.pathname.replace(/\D/g, "") : (url.searchParams.get("phone") || "").replace(/\D/g, "");
    return phone
      ? { name: "contact_whatsapp", params: { link_url: `https://wa.me/${phone}` } }
      : { name: "share", params: { method: "whatsapp", content_type: "article" } };
  }

  if (host === "linkedin.com" && url.pathname.startsWith("/sharing/")) {
    return { name: "share", params: { method: "linkedin", content_type: "article" } };
  }
  if ((host === "twitter.com" || host === "x.com") && url.pathname.startsWith("/intent/")) {
    return { name: "share", params: { method: "x", content_type: "article" } };
  }
  if (host === "facebook.com" && url.pathname.startsWith("/sharer")) {
    return { name: "share", params: { method: "facebook", content_type: "article" } };
  }

  if (url.protocol === "mailto:") return { name: "contact_email", params: {} };
  if (url.protocol === "tel:") return { name: "contact_phone", params: {} };

  return null;
}

/**
 * Um único ouvinte para todos os links da página, inclusive os que vêm do
 * conteúdo dos posts. Marque um bloco com data-cta-location="nome" para saber
 * de qual parte da página veio o clique.
 */
export function installClickTracking(root: Document = document): () => void {
  const handler = (event: MouseEvent) => {
    const target = event.target as Element | null;
    const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!anchor) return;

    const result = classifyLink(anchor.getAttribute("href") || "");
    if (!result) return;

    const location = anchor.closest<HTMLElement>("[data-cta-location]")?.dataset.ctaLocation;
    trackEvent(result.name, {
      ...result.params,
      ...(result.name === "share" ? { item_id: currentPath() } : leadEventParams(result.name)),
      page_path: currentPath(),
      cta_location: location,
      link_text: (anchor.textContent || anchor.getAttribute("aria-label") || "").trim().slice(0, 100),
    });
  };

  root.addEventListener("click", handler, true);
  return () => root.removeEventListener("click", handler, true);
}
