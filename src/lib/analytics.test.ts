import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONSENT_KEY, CONSENT_VERSION } from "./consent";
import {
  buildLeadSource,
  captureAttribution,
  classifyLink,
  getAttribution,
  installClickTracking,
  trackEvent,
} from "./analytics";

describe("classifyLink", () => {
  it("separa contato no WhatsApp de compartilhamento", () => {
    expect(classifyLink("https://wa.me/5512992474969")).toEqual({
      name: "contact_whatsapp",
      params: { link_url: "https://wa.me/5512992474969" },
    });
    expect(classifyLink("https://wa.me/?text=Leia%20isto")?.name).toBe("share");
    expect(classifyLink("https://api.whatsapp.com/send?phone=5512992474969")?.name).toBe("contact_whatsapp");
  });

  it("reconhece compartilhamento, e-mail e telefone", () => {
    expect(classifyLink("https://www.linkedin.com/sharing/share-offsite/?url=x")?.params.method).toBe("linkedin");
    expect(classifyLink("mailto:contato@exemplo.com")?.name).toBe("contact_email");
    expect(classifyLink("tel:+5514999999999")?.name).toBe("contact_phone");
  });

  it("ignora links comuns", () => {
    expect(classifyLink("/servicos")).toBeNull();
    expect(classifyLink("https://www.instagram.com/guilherme.a.correia/")).toBeNull();
  });
});

describe("buildLeadSource", () => {
  it("inclui página, entrada e origem", () => {
    expect(
      buildLeadSource("contact-dialog", "/servicos", { landing: "/blog/icp-b2b", referrer: "www.google.com" }),
    ).toBe("contact-dialog | pág /servicos | entrada /blog/icp-b2b | ref www.google.com");
  });

  it("não repete a entrada quando é a própria página", () => {
    expect(buildLeadSource("home-lead-magnet", "/", { landing: "/", referrer: "" })).toBe(
      "home-lead-magnet | pág /",
    );
  });

  it("nunca passa de 120 caracteres e mantém a origem base", () => {
    const longPath = `/blog/${"a".repeat(150)}`;
    const source = buildLeadSource("contact-dialog", "/servicos", { landing: longPath, referrer: "www.google.com" });
    expect(source.length).toBeLessThanOrEqual(120);
    expect(source.startsWith("contact-dialog | pág /servicos")).toBe(true);
    expect(source).toContain("ref www.google.com");
  });
});

describe("atribuição e eventos", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    // Fase 2.1: eventos e atribuição só com consentimento analítico.
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ version: CONSENT_VERSION, analytics: true, decidedAt: new Date().toISOString() }),
    );
    window.gtag = vi.fn();
  });

  afterEach(() => {
    delete window.gtag;
  });

  it("grava a entrada só na primeira página da sessão", () => {
    captureAttribution(
      { pathname: "/blog/icp-b2b", search: "?utm_source=linkedin&x=1", hostname: "guilhermecorreia.com.br" },
      "https://www.google.com/",
    );
    captureAttribution({ pathname: "/servicos", search: "", hostname: "guilhermecorreia.com.br" }, "");

    expect(getAttribution()).toEqual({
      landing: "/blog/icp-b2b?utm_source=linkedin",
      referrer: "www.google.com",
    });
  });

  it("não envia parâmetros vazios e não falha sem gtag", () => {
    trackEvent("generate_lead", { lead_source: "contact-dialog", service: undefined, cta_location: "" });
    expect(window.gtag).toHaveBeenCalledWith("event", "generate_lead", { lead_source: "contact-dialog" });

    delete window.gtag;
    expect(() => trackEvent("generate_lead")).not.toThrow();
  });

  it("registra clique no WhatsApp com o bloco de origem", () => {
    document.body.innerHTML =
      '<section data-cta-location="servicos-final"><a href="https://wa.me/5512992474969"><span>Chamar no WhatsApp</span></a></section>';
    const uninstall = installClickTracking(document);

    document.querySelector("span")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    uninstall();

    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "contact_whatsapp",
      expect.objectContaining({
        link_url: "https://wa.me/5512992474969",
        cta_location: "servicos-final",
        link_text: "Chamar no WhatsApp",
      }),
    );
  });
});
