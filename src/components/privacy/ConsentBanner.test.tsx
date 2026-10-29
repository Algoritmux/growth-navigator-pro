import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ConsentBanner from "./ConsentBanner";
import LegalLinks from "./LegalLinks";
import { ContactPrivacyNotice, MarketingOptIn, NewsletterPrivacyNotice } from "./FormPrivacy";
import { CONSENT_KEY, CONSENT_VERSION, openConsentPreferences, readConsent } from "@/lib/consent";

function renderAt(path: string, ui = <ConsentBanner />) {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

describe("ConsentBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("aparece na primeira visita com Aceitar e Recusar do mesmo tamanho", () => {
    renderAt("/blog");

    const accept = screen.getByRole("button", { name: "Aceitar" });
    const reject = screen.getByRole("button", { name: "Recusar" });
    expect(accept.className).toBe(reject.className);
    expect(screen.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
  });

  it("recusar grava a escolha e fecha o aviso", () => {
    renderAt("/");
    fireEvent.click(screen.getByRole("button", { name: "Recusar" }));

    expect(readConsent()?.analytics).toBe(false);
    expect(screen.queryByRole("region", { name: "Aviso de cookies" })).toBeNull();
  });

  it("aceitar grava a escolha e fecha o aviso", () => {
    renderAt("/");
    fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));

    expect(readConsent()?.analytics).toBe(true);
    expect(screen.queryByRole("region", { name: "Aviso de cookies" })).toBeNull();
  });

  it("não aparece de novo depois da escolha, mas reabre pelas preferências", () => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ version: CONSENT_VERSION, analytics: true, decidedAt: new Date().toISOString() }),
    );
    renderAt("/");
    expect(screen.queryByRole("region", { name: "Aviso de cookies" })).toBeNull();

    act(() => openConsentPreferences());

    expect(screen.getByTestId("consent-current")).toHaveTextContent("aceitos");
    fireEvent.click(screen.getByRole("button", { name: "Recusar" }));
    expect(readConsent()?.analytics).toBe(false);
  });

  it("não aparece no painel nem no login", () => {
    renderAt("/admin/blog");
    expect(screen.queryByRole("region", { name: "Aviso de cookies" })).toBeNull();
  });
});

describe("links de privacidade e avisos dos formulários", () => {
  it("mostra política e preferências nas páginas sem rodapé, e não na home", () => {
    const { unmount } = renderAt("/blog/um-post", <LegalLinks />);
    expect(screen.getByRole("link", { name: "Política de Privacidade" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preferências de cookies" })).toBeInTheDocument();
    unmount();

    renderAt("/", <LegalLinks />);
    expect(screen.queryByRole("button", { name: "Preferências de cookies" })).toBeNull();
  });

  it("opção de marketing começa desmarcada e é opcional", () => {
    let value = false;
    render(<MarketingOptIn id="mkt" checked={false} onCheckedChange={(next) => (value = next)} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText(/opcional/)).toBeInTheDocument();
    fireEvent.click(checkbox);
    expect(value).toBe(true);
  });

  it("avisos dos formulários levam à política em nova aba", () => {
    render(
      <>
        <ContactPrivacyNotice />
        <NewsletterPrivacyNotice />
      </>,
    );

    for (const link of screen.getAllByRole("link", { name: "Política de Privacidade" })) {
      expect(link).toHaveAttribute("href", "/privacidade");
      expect(link).toHaveAttribute("target", "_blank");
    }
    expect(screen.getByText(/Cancele quando quiser/)).toBeInTheDocument();
  });
});
