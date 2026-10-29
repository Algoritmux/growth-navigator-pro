import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLead, subscribeToNewsletter } from "./leadsApi";

function mockFetch(body: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function sentEvents() {
  return vi.mocked(window.gtag!).mock.calls.map((call) => call[1]);
}

describe("eventos de conversão nos formulários", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.gtag = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.gtag;
  });

  it("envia generate_lead uma vez, só depois do sucesso, com a página na origem", async () => {
    const fetchMock = mockFetch({ success: true, id: 7 });

    await createLead({ name: "Ana", email: "ana@empresa.com", source: "contact-dialog", service: "Consultoria" });

    expect(sentEvents()).toEqual(["generate_lead"]);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.source).toMatch(/^contact-dialog \| pág \//);
    expect(body.source.length).toBeLessThanOrEqual(120);
  });

  it("não envia dados pessoais ao GA4", async () => {
    mockFetch({ success: true });

    await createLead({ name: "Ana", email: "ana@empresa.com", phone: "14999999999", source: "contact-dialog" });

    const params = JSON.stringify(vi.mocked(window.gtag!).mock.calls);
    expect(params).not.toContain("ana@empresa.com");
    expect(params).not.toContain("Ana");
    expect(params).not.toContain("14999999999");
  });

  it("não envia generate_lead quando a API recusa ou falha", async () => {
    mockFetch({ success: false, message: "E-mail inválido." }, false);
    await expect(createLead({ name: "Ana", email: "x", source: "contact-dialog" })).rejects.toThrow("E-mail inválido.");

    mockFetch({ success: false, message: "Erro ao salvar lead." }, true);
    await expect(createLead({ name: "Ana", email: "ana@empresa.com" })).rejects.toThrow();

    expect(sentEvents()).toEqual([]);
  });

  it("conta sign_up só para inscrição nova", async () => {
    mockFetch({ success: true, is_new: true });
    await subscribeToNewsletter({ email: "ana@empresa.com", source: "blog-post-sidebar" });

    mockFetch({ success: true, is_new: false });
    await subscribeToNewsletter({ email: "ana@empresa.com", source: "blog-post-sidebar" });

    expect(sentEvents()).toEqual(["sign_up"]);
  });
});
