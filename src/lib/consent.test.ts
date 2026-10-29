import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_KEY,
  CONSENT_MAX_AGE_DAYS,
  CONSENT_VERSION,
  GA_MEASUREMENT_ID,
  readConsent,
  saveConsent,
} from "./consent";
import { buildLeadSource, captureAttribution, currentPath, getAttribution, trackEvent } from "./analytics";

const indexHtml = readFileSync(fileURLToPath(new URL("../../index.html", import.meta.url)), "utf8");
const bootstrap = indexHtml.match(/<script id="gc-consent-bootstrap">([\s\S]*?)<\/script>/)?.[1] ?? "";

type GtagWindow = Window & { dataLayer?: unknown[]; [key: string]: unknown };
const win = window as GtagWindow;

function runBootstrap() {
  // No navegador a "function gtag" do script vira window.gtag; aqui expomos igual.
  // eslint-disable-next-line no-new-func
  new Function(`${bootstrap}\nwindow.gtag = gtag;`)();
}

function dataLayerCalls() {
  return (win.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
}

function gaScripts() {
  return document.head.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
}

function storeConsent(analytics: boolean, decidedAt = new Date().toISOString(), version = CONSENT_VERSION) {
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ version, analytics, decidedAt }));
}

function resetPage() {
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.head.innerHTML = "";
  delete win.dataLayer;
  delete win.gtag;
  delete win.gcLoadAnalytics;
  delete win.gcAnalyticsLoaded;
  delete win[`ga-disable-${GA_MEASUREMENT_ID}`];
}

describe("script de consentimento do index.html", () => {
  beforeEach(resetPage);

  it("usa as mesmas constantes de consent.ts", () => {
    expect(bootstrap).toContain(`var GA_ID = "${GA_MEASUREMENT_ID}"`);
    expect(bootstrap).toContain(`var CONSENT_KEY = "${CONSENT_KEY}"`);
    expect(bootstrap).toContain(`var CONSENT_VERSION = ${CONSENT_VERSION};`);
    expect(bootstrap).toContain(`var CONSENT_MAX_AGE_DAYS = ${CONSENT_MAX_AGE_DAYS};`);
  });

  it("não carrega o GA4 nem chama config sem consentimento", () => {
    runBootstrap();

    expect(gaScripts()).toHaveLength(0);
    const calls = dataLayerCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("consent");
    expect(calls[0][1]).toBe("default");
    expect(calls[0][2]).toMatchObject({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
    expect(indexHtml).not.toMatch(/<script[^>]+src="https:\/\/www\.googletagmanager\.com/);
  });

  it("não carrega com recusa, versão antiga ou escolha vencida", () => {
    for (const setup of [
      () => storeConsent(false),
      () => storeConsent(true, new Date().toISOString(), CONSENT_VERSION - 1),
      () => storeConsent(true, new Date(Date.now() - (CONSENT_MAX_AGE_DAYS + 1) * 864e5).toISOString()),
      () => window.localStorage.setItem(CONSENT_KEY, "{quebrado"),
    ]) {
      resetPage();
      setup();
      runBootstrap();
      expect(gaScripts()).toHaveLength(0);
    }
  });

  it("carrega o GA4 com aceite salvo, liberando só analytics e antes do config", () => {
    storeConsent(true);
    runBootstrap();

    expect(gaScripts()).toHaveLength(1);
    const calls = dataLayerCalls();
    const update = calls.findIndex((c) => c[0] === "consent" && c[1] === "update");
    const config = calls.findIndex((c) => c[0] === "config");
    expect(calls[update][2]).toEqual({ analytics_storage: "granted" });
    expect(update).toBeLessThan(config);
    expect(calls.some((c) => c[0] === "consent" && c[1] === "update" && "ad_storage" in (c[2] as object))).toBe(false);
  });
});

describe("escolha do visitante", () => {
  beforeEach(() => {
    resetPage();
    runBootstrap();
  });

  afterEach(() => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = `${c.split("=")[0].trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  });

  it("aceitar grava a escolha e carrega o GA4 uma única vez", () => {
    const listener = vi.fn();
    window.addEventListener(CONSENT_CHANGE_EVENT, listener);

    saveConsent(true);
    saveConsent(true);

    expect(readConsent()?.analytics).toBe(true);
    expect(gaScripts()).toHaveLength(1);
    expect(listener).toHaveBeenCalledTimes(2);
    window.removeEventListener(CONSENT_CHANGE_EVENT, listener);
  });

  it("recusar não carrega o GA4", () => {
    saveConsent(false);

    expect(readConsent()?.analytics).toBe(false);
    expect(gaScripts()).toHaveLength(0);
  });

  it("retirar o consentimento desliga o GA4 e apaga os cookies _ga", () => {
    saveConsent(true);
    document.cookie = "_ga=GA1.1.123; path=/";
    document.cookie = "_ga_8PJTEYT1PV=GS1.1.456; path=/";
    document.cookie = "outro=mantido; path=/";

    saveConsent(false);

    expect(win[`ga-disable-${GA_MEASUREMENT_ID}`]).toBe(true);
    expect(document.cookie).not.toContain("_ga");
    expect(document.cookie).toContain("outro=mantido");
    const last = dataLayerCalls().at(-1);
    expect(last).toEqual(["consent", "update", { analytics_storage: "denied" }]);
  });

  it("aceitar de novo na mesma página religa o GA4 sem baixar o script outra vez", () => {
    saveConsent(true);
    saveConsent(false);
    saveConsent(true);

    expect(win[`ga-disable-${GA_MEASUREMENT_ID}`]).toBe(false);
    expect(gaScripts()).toHaveLength(1);
  });
});

describe("eventos e atribuição dependem do consentimento", () => {
  beforeEach(() => {
    resetPage();
    runBootstrap();
  });

  it("evento antes do aceite é descartado, não enfileirado", () => {
    const before = dataLayerCalls().length;
    trackEvent("generate_lead", { lead_source: "contact-dialog" });

    expect(dataLayerCalls()).toHaveLength(before);

    saveConsent(true);
    expect(dataLayerCalls().some((c) => c[1] === "generate_lead")).toBe(false);

    trackEvent("generate_lead", { lead_source: "contact-dialog" });
    expect(dataLayerCalls().at(-1)).toEqual(["event", "generate_lead", { lead_source: "contact-dialog" }]);
  });

  it("sem consentimento a entrada não é gravada e o lead leva só a página atual", () => {
    captureAttribution(
      { pathname: "/blog/icp-b2b", search: "", hostname: "guilhermecorreia.com.br" },
      "https://www.google.com/",
    );

    expect(window.sessionStorage.length).toBe(0);
    expect(buildLeadSource("contact-dialog", currentPath(), getAttribution())).toBe(
      `contact-dialog | pág ${currentPath()}`,
    );
  });

  it("aceitar na mesma aba grava a entrada guardada em memória; recusar apaga", () => {
    captureAttribution(
      { pathname: "/blog/icp-b2b", search: "", hostname: "guilhermecorreia.com.br" },
      "https://www.google.com/",
    );

    saveConsent(true);
    expect(getAttribution()).toEqual({ landing: "/blog/icp-b2b", referrer: "www.google.com" });

    saveConsent(false);
    expect(window.sessionStorage.getItem("gc_attribution")).toBeNull();
  });
});
