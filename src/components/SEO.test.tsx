import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import SEO, { absoluteImageUrl, canonicalUrl } from "./SEO";

function meta(selector: string) {
  return document.head.querySelector(selector)?.getAttribute("content");
}

describe("SEO", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.title = "";
  });

  it("monta a URL canônica sem query string e sem barra final", () => {
    expect(canonicalUrl("/blog/meu-post/?utm_source=x")).toBe(
      "https://guilhermecorreia.com.br/blog/meu-post",
    );
    expect(canonicalUrl("/")).toBe("https://guilhermecorreia.com.br/");
  });

  it("usa imagem padrão quando a capa não é URL pública", () => {
    expect(absoluteImageUrl("/lovable-uploads/capa.jpg")).toBe(
      "https://guilhermecorreia.com.br/lovable-uploads/capa.jpg",
    );
    expect(absoluteImageUrl("data:image/png;base64,AAAA")).toBe(
      "https://guilhermecorreia.com.br/og-image.png",
    );
  });

  it("troca canonical e Open Graph que vieram da home", () => {
    document.head.innerHTML = `
      <link rel="canonical" href="https://guilhermecorreia.com.br/" />
      <meta property="og:url" content="https://guilhermecorreia.com.br/" />
      <meta property="og:title" content="Home" />
      <script type="application/ld+json" id="seo-json-ld">{"@type":"BlogPosting"}</script>
    `;

    render(
      <SEO
        title="Meu post"
        description="Resumo do post"
        path="/blog/meu-post"
        image="/lovable-uploads/capa.jpg"
        type="article"
        jsonLd={{ "@type": "BlogPosting", headline: "Meu post" }}
      />,
    );

    expect(document.title).toBe("Meu post | Guilherme Correia");
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://guilhermecorreia.com.br/blog/meu-post",
    );
    expect(meta('meta[property="og:url"]')).toBe("https://guilhermecorreia.com.br/blog/meu-post");
    expect(meta('meta[property="og:title"]')).toBe("Meu post | Guilherme Correia");
    expect(meta('meta[property="og:type"]')).toBe("article");
    expect(meta('meta[property="og:image"]')).toBe(
      "https://guilhermecorreia.com.br/lovable-uploads/capa.jpg",
    );
    expect(meta('meta[name="description"]')).toBe("Resumo do post");
    expect(document.head.querySelectorAll("#seo-json-ld")).toHaveLength(1);
    expect(document.getElementById("seo-json-ld")?.textContent).toContain('"headline":"Meu post"');
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it("marca páginas inexistentes como noindex", () => {
    render(<SEO title="Página não encontrada" noindex />);

    expect(meta('meta[name="robots"]')).toBe("noindex, follow");
  });
});
