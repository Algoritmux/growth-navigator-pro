/**
 * Consentimento de cookies analíticos (Google Consent Mode v2, modo básico).
 *
 * Regras:
 * - Tudo negado por padrão. O index.html registra o consentimento negado e só
 *   baixa o gtag.js depois do aceite (window.gcLoadAnalytics).
 * - Anúncios e personalização ficam sempre negados.
 * - Recusar ou retirar o consentimento desliga o GA4 na hora, apaga os cookies
 *   _ga e a atribuição da sessão.
 * - A escolha vale 12 meses e é refeita quando CONSENT_VERSION muda
 *   (ex.: alteração relevante da política).
 *
 * Mantenha CONSENT_KEY, CONSENT_VERSION, CONSENT_MAX_AGE_DAYS e GA_MEASUREMENT_ID
 * iguais aos do script de consentimento do index.html (há teste que confere).
 */

export const CONSENT_KEY = "gc_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 365;
export const GA_MEASUREMENT_ID = "G-8PJTEYT1PV";

export const CONSENT_CHANGE_EVENT = "gc-consent-change";
export const OPEN_CONSENT_EVENT = "gc-open-consent";

export type ConsentState = {
  version: number;
  analytics: boolean;
  /** ISO 8601 */
  decidedAt: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    gcLoadAnalytics?: () => void;
    gcAnalyticsLoaded?: boolean;
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function readConsent(now: Date = new Date()): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION || typeof parsed.analytics !== "boolean") return null;
    const decidedAt = Date.parse(String(parsed.decidedAt));
    if (Number.isNaN(decidedAt) || now.getTime() - decidedAt > CONSENT_MAX_AGE_DAYS * DAY_MS) return null;
    return parsed as ConsentState;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}

function setGaDisabled(disabled: boolean) {
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = disabled;
}

/** Apaga _ga, _ga_<id> e _gid no domínio atual e no domínio raiz. */
export function deleteAnalyticsCookies() {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = new Set(["", host, `.${host}`]);
  for (let i = 1; i < parts.length - 1; i++) domains.add(`.${parts.slice(i).join(".")}`);

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!/^(_ga|_gid|_gat)/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

function applyAnalyticsConsent(granted: boolean) {
  if (granted) {
    setGaDisabled(false);
    if (!window.gcAnalyticsLoaded && typeof window.gcLoadAnalytics === "function") {
      window.gcLoadAnalytics();
    } else {
      window.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
    return;
  }

  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  setGaDisabled(true);
  deleteAnalyticsCookies();
}

export function saveConsent(analytics: boolean, now: Date = new Date()): ConsentState {
  const state: ConsentState = { version: CONSENT_VERSION, analytics, decidedAt: now.toISOString() };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    // Sem armazenamento a escolha vale só para esta página; o padrão segue negado.
  }
  applyAnalyticsConsent(analytics);
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state }));
  return state;
}

/** Reabre o aviso de cookies (link "Preferências de cookies"). */
export function openConsentPreferences() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
