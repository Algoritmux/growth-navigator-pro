import { describe, expect, it } from "vitest";
import {
  contentToHtml,
  extractCoverImageSrc,
  extractFirstImageSrc,
  withCoverImageMeta,
} from "./markdown";
import { resolveBlogMediaUrl } from "./blogMedia";

function parseHtml(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}

function expectNoHtmlToken(html: string) {
  expect(html).not.toMatch(/BLOG_?HTML_?TOKEN/i);
}

const TEST_API_BASE_URL = "http://localhost/backend/api";
const TEST_PUBLIC_ORIGIN = "http://localhost";
const PRODUCTION_API_BASE_URL = "https://guilhermecorreia.com.br/backend/api";

describe("resolveBlogMediaUrl", () => {
  it("resolves server absolute upload paths against a controlled test origin", () => {
    expect(resolveBlogMediaUrl("/lovable-uploads/blog-fundo.jpg", TEST_API_BASE_URL)).toBe(
      `${TEST_PUBLIC_ORIGIN}/lovable-uploads/blog-fundo.jpg`,
    );
  });

  it("resolves production upload paths against the production public origin", () => {
    expect(resolveBlogMediaUrl("/lovable-uploads/blog-fundo.jpg", PRODUCTION_API_BASE_URL)).toBe(
      "https://guilhermecorreia.com.br/lovable-uploads/blog-fundo.jpg",
    );
  });

  it("keeps absolute and data urls untouched", () => {
    expect(resolveBlogMediaUrl("https://cdn.example.com/image.jpg", TEST_API_BASE_URL)).toBe(
      "https://cdn.example.com/image.jpg",
    );
    expect(resolveBlogMediaUrl("data:image/png;base64,abc", TEST_API_BASE_URL)).toBe(
      "data:image/png;base64,abc",
    );
  });

  it("returns an empty string for empty media urls", () => {
    expect(resolveBlogMediaUrl("", TEST_API_BASE_URL)).toBe("");
    expect(resolveBlogMediaUrl("   ", TEST_API_BASE_URL)).toBe("");
  });
});

describe("contentToHtml special blog blocks", () => {
  it("stores cover image metadata without rendering it in the article body", () => {
    const content = withCoverImageMeta(
      "## Inicio\n\n![Imagem interna](/lovable-uploads/interna.png)",
      "/lovable-uploads/capa.png",
    );
    const html = contentToHtml(content);

    expect(extractCoverImageSrc(content)).toBe("/lovable-uploads/capa.png");
    expect(extractFirstImageSrc(content)).toBe("/lovable-uploads/interna.png");
    expect(html).not.toContain("blog-cover-image");
    expect(html).toContain('<h2 id="inicio">Inicio</h2>');
  });

  it("renders markdown h2 and h3 headings with stable ids", () => {
    const html = contentToHtml(`
## O que é crescimento previsível?

Texto normal.

### Primeiro passo

Mais texto.
`);

    expect(html).toContain(
      '<h2 id="o-que-e-crescimento-previsivel">O que é crescimento previsível?</h2>',
    );
    expect(html).toContain('<h3 id="primeiro-passo">Primeiro passo</h3>');
    expect(html).not.toContain("## O que é crescimento previsível?");
    expect(html).not.toContain("### Primeiro passo");
  });

  it("keeps markdown headings separate from the next paragraph", () => {
    const html = contentToHtml(`
## O que é crescimento previsível?

Crescimento previsível é a capacidade de gerar oportunidades, vendas e receita com mais consistência.
`);
    const doc = parseHtml(html);
    const heading = doc.querySelector("h2");
    const paragraph = doc.querySelector("p");

    expect(heading?.textContent).toBe("O que é crescimento previsível?");
    expect(heading?.id).toBe("o-que-e-crescimento-previsivel");
    expect(heading?.textContent).not.toContain("Crescimento previsível é");
    expect(paragraph?.textContent).toBe(
      "Crescimento previsível é a capacidade de gerar oportunidades, vendas e receita com mais consistência.",
    );
  });

  it("renders allowed inline HTML instead of showing tags as text", () => {
    const html = contentToHtml(`
Texto com <strong>parte importante</strong>, <em>enfase</em> e <a href="https://example.com">link externo</a>.
`);
    const doc = parseHtml(html);

    expect(doc.querySelector("strong")?.textContent).toBe("parte importante");
    expect(doc.querySelector("em")?.textContent).toBe("enfase");
    expect(doc.querySelector("a")?.getAttribute("href")).toBe("https://example.com");
    expect(doc.body.textContent).not.toContain("<strong>");
    expect(doc.body.textContent).not.toContain("</strong>");
    expectNoHtmlToken(html);
  });

  it("renders inline strong without leaking internal tokens", () => {
    const html = contentToHtml("Antes <strong>texto importante</strong> depois");

    expect(html).toContain("<strong>texto importante</strong>");
    expect(html).not.toContain("&lt;strong&gt;");
    expectNoHtmlToken(html);
  });

  it("renders inline em without leaking internal tokens", () => {
    const html = contentToHtml("<em>texto em italico</em>");

    expect(html).toContain("<em>texto em italico</em>");
    expectNoHtmlToken(html);
  });

  it("renders allowed inline links without leaking internal tokens", () => {
    const html = contentToHtml('<a href="https://example.com">link</a>');

    expect(html).toContain("<a");
    expect(html).toContain('href="https://example.com"');
    expectNoHtmlToken(html);
  });

  it("preserves allowed div blocks and nested inline html without leaking tokens", () => {
    const html = contentToHtml(
      '<div class="blog-callout"><strong>Ideia:</strong> texto</div>',
    );
    const doc = parseHtml(html);

    expect(doc.querySelector(".blog-callout")).not.toBeNull();
    expect(doc.querySelector(".blog-callout strong")?.textContent).toBe("Ideia:");
    expectNoHtmlToken(html);
  });

  it("preserves figure markup without leaking tokens", () => {
    const html = contentToHtml(
      '<figure><img src="/lovable-uploads/teste.jpg" alt="Teste"><figcaption>Legenda</figcaption></figure>',
    );
    const doc = parseHtml(html);

    expect(doc.querySelector("figure")).not.toBeNull();
    expect(doc.querySelector("img")?.getAttribute("src")).toBe(
      `${TEST_PUBLIC_ORIGIN}/lovable-uploads/teste.jpg`,
    );
    expect(doc.querySelector("figcaption")?.textContent).toBe("Legenda");
    expectNoHtmlToken(html);
  });

  it("renders the real validation snippet without visible html or tokens", () => {
    const html = contentToHtml(`
## O que muda quando marketing vira sistema?

Um sistema de crescimento conecta varias areas da empresa.

Marketing deixa de trabalhar apenas para gerar atencao.  
Vendas deixa de trabalhar apenas para fechar contratos.  
Customer Success deixa de trabalhar apenas para apagar incendios.  
Produto deixa de trabalhar apenas para entregar funcionalidades.

Tudo passa a responder uma pergunta central:

<strong>qual parte da jornada esta impedindo o cliente de perceber valor e continuar avancando?</strong>
`);
    const doc = parseHtml(html);

    expect(doc.querySelector("h2")?.textContent).toBe(
      "O que muda quando marketing vira sistema?",
    );
    expect(doc.querySelector("strong")?.textContent).toBe(
      "qual parte da jornada esta impedindo o cliente de perceber valor e continuar avancando?",
    );
    expect(doc.body.textContent).not.toContain("<strong>");
    expectNoHtmlToken(html);
  });

  it("resolves rendered markdown and html image urls to the backend public origin", () => {
    const html = contentToHtml(`
![Fundo](/lovable-uploads/blog-fundo.jpg)

<figure>
  <img src="/uploads/interna.jpg" alt="Fundo">
  <figcaption>Fundo</figcaption>
</figure>
`);
    const doc = parseHtml(html);
    const images = Array.from(doc.querySelectorAll("img")).map((image) =>
      image.getAttribute("src"),
    );

    expect(images).toEqual([
      `${TEST_PUBLIC_ORIGIN}/lovable-uploads/blog-fundo.jpg`,
      `${TEST_PUBLIC_ORIGIN}/uploads/interna.jpg`,
    ]);
  });

  it("renders simple lists, numbered lists, links and separators with editorial classes", () => {
    const html = contentToHtml(`
## Checklist

- Primeiro item
- Segundo item com [link](/biblioteca)

1. Diagnosticar
2. Priorizar

---
`);
    const doc = parseHtml(html);

    expect(doc.querySelector("ul.blog-editorial-list")).not.toBeNull();
    expect(doc.querySelector("ol.blog-numbered-list")).not.toBeNull();
    expect(doc.querySelector("ul.blog-editorial-list")?.getAttribute("class")).toBe(
      "blog-editorial-list",
    );
    expect(doc.querySelector("ol.blog-numbered-list")?.getAttribute("class")).toBe(
      "blog-numbered-list",
    );
    expect(doc.querySelector("a")?.getAttribute("href")).toBe("/biblioteca");
    expect(doc.querySelector("hr")).not.toBeNull();
    expect(doc.querySelectorAll("li")).toHaveLength(4);
  });

  it("keeps standalone numbers as plain text instead of turning them into cards", () => {
    const html = contentToHtml(`
1
Diagnostique a jornada do cliente.

2
Priorize experimentos com impacto claro.
`);
    const doc = parseHtml(html);

    expect(doc.querySelector("ol.blog-loose-steps")).toBeNull();
    expect(doc.querySelectorAll(".blog-loose-step")).toHaveLength(0);
    expect(doc.querySelector("p")?.textContent).toBe("1");
  });

  it("renders numbered lists with descriptions under each item as one clean list", () => {
    const html = contentToHtml(`
## Principais etapas de uma estrategia de growth

1. Diagnostico da jornada
Antes de criar novas campanhas, entenda os pontos de atrito.

2. Definicao de hipoteses
Depois do diagnostico, escolha o que precisa ser testado.

3. Execucao de testes
Os testes devem ser simples e mensuraveis.

4. Analise dos resultados
Toda acao precisa gerar aprendizado.

5. Escala do que funciona
Quando uma hipotese gera resultado, transforme em processo.
`);
    const doc = parseHtml(html);
    const list = doc.querySelector("ol.blog-numbered-list");
    const items = Array.from(doc.querySelectorAll("ol.blog-numbered-list > li"));

    expect(list).not.toBeNull();
    expect(items).toHaveLength(5);
    expect(items[0].innerHTML).toContain("Diagnostico da jornada<br>");
    expect(items[2].textContent).toContain("Execucao de testes");
    expect(items[2].textContent).toContain("Os testes devem ser simples");
    expect(doc.querySelector("ol.blog-loose-steps")).toBeNull();
    expect(html).not.toContain("blog-loose-step-number");
  });

  it("renders markdown special blocks as styled HTML", () => {
    const html = contentToHtml(`
## Como funciona?

Texto normal.

[card-numero numero="1" titulo="Tempo de casa"]
Os socios atuais precisam conhecer bem o candidato.
[/card-numero]

[material titulo="Guia gratuito" botao="Ver biblioteca" link="/biblioteca"]
Acesse frameworks praticos.
[/material]

[citacao autor="Guilherme Correia"]
Crescimento previsivel nasce de sistema.
[/citacao]

[bloco-destaque]
Texto importante em destaque.
[/bloco-destaque]
`);

    expect(html).toContain('<h2 id="como-funciona">Como funciona?</h2>');
    expect(html).toContain('class="not-prose blog-special-block blog-special-number-card"');
    expect(html).toContain('class="blog-special-number"');
    expect(html).toContain("Tempo de casa");
    expect(html).toContain('class="not-prose blog-special-block blog-special-material"');
    expect(html).toContain('href="/biblioteca"');
    expect(html).toContain('class="not-prose blog-special-block blog-special-quote"');
    expect(html).toContain("<figcaption>Guilherme Correia</figcaption>");
    expect(html).toContain('class="not-prose blog-special-block blog-special-highlight"');
  });

  it("renders steps, editorial list and image caption blocks", () => {
    const html = contentToHtml(`
[passos]
[passo titulo="Aquisicao"]
Atraia pessoas certas.
[/passo]
[passo titulo="Retencao"]
Mantenha clientes ativos.
[/passo]
[/passos]

[lista]
- CAC
- Retencao
[/lista]

[imagem src="/lovable-uploads/exemplo.png" alt="Diagrama" legenda="Legenda curta"]
`);
    const doc = parseHtml(html);

    expect(doc.querySelector(".blog-special-steps")).not.toBeNull();
    expect(doc.querySelectorAll(".blog-special-step")).toHaveLength(2);
    expect(doc.querySelector(".blog-special-list")).not.toBeNull();
    expect(doc.querySelector(".blog-special-image img")?.getAttribute("src")).toBe(
      `${TEST_PUBLIC_ORIGIN}/lovable-uploads/exemplo.png`,
    );
    expect(doc.querySelector(".blog-special-image figcaption")?.textContent).toBe(
      "Legenda curta",
    );
    expect(html).not.toContain("[passos]");
    expect(html).not.toContain("[passo");
    expect(html).not.toContain("[lista]");
    expect(html).not.toContain("[imagem");
  });

  it("renders editor figure HTML as image with caption", () => {
    const html = contentToHtml(
      '<figure><img src="/lovable-uploads/grafico.png" alt="Grafico de crescimento"><figcaption>Legenda do grafico</figcaption></figure>',
    );
    const doc = parseHtml(html);

    expect(doc.querySelector("figure img")?.getAttribute("src")).toBe(
      `${TEST_PUBLIC_ORIGIN}/lovable-uploads/grafico.png`,
    );
    expect(doc.querySelector("figure img")?.getAttribute("alt")).toBe(
      "Grafico de crescimento",
    );
    expect(doc.querySelector("figure figcaption")?.textContent).toBe(
      "Legenda do grafico",
    );
    expect(html).toContain("<figure>");
  });

  it("renders mixed editor HTML headings and special blocks", () => {
    const html = contentToHtml(
      [
        "<p>## O que é crescimento previsível?</p>",
        "<p>Texto normal.</p>",
        "<p>[bloco-destaque]</p>",
        "<p>Texto importante.</p>",
        "<p>[/bloco-destaque]</p>",
        "<p>### Primeiro passo</p>",
        "<p>Mais texto.</p>",
      ].join(""),
    );

    expect(html).toContain(
      '<h2 id="o-que-e-crescimento-previsivel">O que é crescimento previsível?</h2>',
    );
    expect(html).toContain('<h3 id="primeiro-passo">Primeiro passo</h3>');
    expect(html).toContain('class="not-prose blog-special-block blog-special-highlight"');
    expect(html).toContain("<p>Texto normal.</p>");
    expect(html).toContain("<p>Mais texto.</p>");
    expect(html).not.toContain("## O que é crescimento previsível?");
    expect(html).not.toContain("### Primeiro passo");
    expect(html).not.toContain("[/bloco-destaque]");
  });

  it("normalizes editor HTML paragraphs before parsing markdown headings", () => {
    const html = contentToHtml(
      [
        "<p>## O que é crescimento previsível?<br><br>Crescimento previsível é a capacidade de gerar oportunidades, vendas e receita com mais consistência.</p>",
        "<p>[bloco-destaque]</p>",
        "<p>O crescimento previsível acontece quando a empresa deixa de depender de ações isoladas.</p>",
        "<p>[/bloco-destaque]</p>",
        "<p>## Por que muitas empresas não conseguem crescer de forma consistente?</p>",
        "<p>Muitas operações até conseguem gerar leads, mas não conseguem transformar isso em receita previsível.</p>",
        "<p>### Falta de clareza sobre o ICP</p>",
        "<p>Quando a empresa não sabe exatamente quem é o cliente ideal, a comunicação fica genérica.</p>",
        '<p>[card-numero numero="1" titulo="Clareza estratégica"]</p>',
        "<p>Antes de escalar campanhas, a empresa precisa entender ICP, oferta e posicionamento.</p>",
        "<p>[/card-numero]</p>",
      ].join(""),
    );
    const doc = parseHtml(html);
    const tocHeadings = Array.from(doc.querySelectorAll("h2, h3")).map(
      (heading) => heading.textContent,
    );

    expect(tocHeadings).toEqual([
      "O que é crescimento previsível?",
      "Por que muitas empresas não conseguem crescer de forma consistente?",
      "Falta de clareza sobre o ICP",
    ]);
    expect(doc.querySelector("h2")?.textContent).not.toContain(
      "Crescimento previsível é a capacidade",
    );
    expect(html).not.toContain("## O que é crescimento previsível?");
    expect(html).not.toContain(
      "## Por que muitas empresas não conseguem crescer de forma consistente?",
    );
    expect(html).not.toContain("### Falta de clareza sobre o ICP");
    expect(html).toContain('class="not-prose blog-special-block blog-special-highlight"');
    expect(html).toContain('class="not-prose blog-special-block blog-special-number-card"');
    expect(html).toContain("Clareza estratégica");
  });

  it("renders special blocks saved as sanitized editor HTML", () => {
    const html = contentToHtml(
      '<p>[card-numero numero="2" titulo="Desempenho consistente"]</p><p>Historico de confianca.</p><p>[/card-numero]</p>',
    );

    expect(html).toContain('class="not-prose blog-special-block blog-special-number-card"');
    expect(html).toContain("Desempenho consistente");
    expect(html).toContain("<p>Historico de confianca.</p>");
    expect(html).not.toContain("[/card-numero]");
  });

  it("renders incomplete blocks safely without leaking raw shortcodes", () => {
    const html = contentToHtml(`[material titulo="Guia"]\nTexto sem fechamento.`);

    expect(html).toContain('class="not-prose blog-special-block blog-special-material"');
    expect(html).toContain("Texto sem fechamento.");
    expect(html).not.toContain("[material");
  });

  it("keeps malformed steps from breaking the page or leaking wrapper tags", () => {
    const html = contentToHtml(`
[passos]
[passo titulo="Primeiro"]
Conteudo do primeiro passo.
[/passo]
`);
    const doc = parseHtml(html);

    expect(doc.querySelector(".blog-special-steps")).not.toBeNull();
    expect(doc.querySelectorAll(".blog-special-step")).toHaveLength(1);
    expect(html).toContain("Conteudo do primeiro passo.");
    expect(html).not.toContain("[passos]");
    expect(html).not.toContain("[passo");
  });

  it("escapes attributes and sanitizes material links", () => {
    const html = contentToHtml(`
[material titulo="<script>alert(1)</script>" botao="<b>Baixar</b>" link="javascript:alert(1)"]
Descricao segura.
[/material]
`);

    expect(html).toContain("&lt;b&gt;Baixar&lt;/b&gt;");
    expect(html).toContain('href="#"');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("javascript:alert");
  });

  it("keeps images from breaking headings and special blocks", () => {
    const html = contentToHtml(`
## Antes da imagem

![Diagrama de funil](https://cdn.example.com/funil.png)

[material titulo="Playbook Avancado" botao="Ver biblioteca" link="/biblioteca"]
Acesse gratuitamente nossa biblioteca de frameworks de GTM.
[/material]

<img src="https://cdn.example.com/processo.png" alt="Processo">

### Depois da imagem

Texto final.
`);
    const doc = parseHtml(html);

    expect(doc.querySelectorAll("img")).toHaveLength(2);
    expect(doc.querySelector("img")?.getAttribute("src")).toBe(
      "https://cdn.example.com/funil.png",
    );
    expect(html).toContain('class="not-prose blog-special-block blog-special-material"');
    expect(doc.querySelector("h2")?.textContent).toBe("Antes da imagem");
    expect(doc.querySelector("h3")?.textContent).toBe("Depois da imagem");
    expect(html).not.toContain("[/material]");
  });

  it("renders heading, image block, steps and material together without raw tags", () => {
    const html = contentToHtml(`
## Plano de execucao

[imagem src="/lovable-uploads/plano.png" alt="Plano" legenda="Mapa do plano"]

[passos]
[passo titulo="Diagnostico"]
Entenda o ponto de partida.
[/passo]
[passo titulo="Execucao"]
Transforme prioridade em rotina.
[/passo]
[/passos]

[material titulo="Guia" botao="Ver biblioteca" link="/biblioteca"]
Continue estudando.
[/material]
`);
    const doc = parseHtml(html);

    expect(doc.querySelector("h2")?.textContent).toBe("Plano de execucao");
    expect(doc.querySelector(".blog-special-image img")?.getAttribute("alt")).toBe(
      "Plano",
    );
    expect(doc.querySelectorAll(".blog-special-step")).toHaveLength(2);
    expect(doc.querySelector(".blog-special-material")).not.toBeNull();
    expect(html).not.toContain("[imagem");
    expect(html).not.toContain("[passos]");
    expect(html).not.toContain("[material");
  });

  it("opens only external links in a new tab", () => {
    const html = contentToHtml(
      [
        "[Biblioteca](/biblioteca)",
        "[Site publico](https://guilhermecorreia.com.br/blog)",
        "[Instagram](https://www.instagram.com/guilherme.a.correia/)",
      ].join("\n\n"),
    );
    const doc = parseHtml(html);
    const links = Array.from(doc.querySelectorAll("a"));

    expect(links[0].getAttribute("target")).toBeNull();
    expect(links[1].getAttribute("target")).toBeNull();
    expect(links[2].getAttribute("target")).toBe("_blank");
    expect(links[2].getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("preserves safe editorial HTML classes", () => {
    const html = contentToHtml(`
<div class="blog-callout">
  <strong>Ideia central:</strong> texto do destaque.
</div>
<div class="blog-stat-grid">
  <div class="blog-stat-card">
    <strong>70%</strong>
    <span>texto da estatistica</span>
  </div>
</div>
<div class="blog-step-card">
  <span>01</span>
  <div><strong>Diagnostico</strong><p>Texto.</p></div>
</div>
`);
    const doc = parseHtml(html);

    expect(doc.querySelector(".blog-callout strong")?.textContent).toBe(
      "Ideia central:",
    );
    expect(doc.querySelector(".blog-stat-grid .blog-stat-card strong")?.textContent).toBe(
      "70%",
    );
    expect(doc.querySelector(".blog-step-card > span")?.textContent).toBe("01");
  });

  it("renders markdown tables", () => {
    const html = contentToHtml(`
| Criterio | Estrategia | Execucao |
| --- | --- | --- |
| Foco | Longo prazo | Rotina |
`);
    const doc = parseHtml(html);

    expect(doc.querySelector(".blog-table-wrap table")).not.toBeNull();
    expect(doc.querySelectorAll("th")).toHaveLength(3);
    expect(doc.querySelector("td")?.textContent).toBe("Foco");
  });

  it("removes unsafe html, events, javascript urls, inline style and unknown classes", () => {
    const html = contentToHtml(`
<div class="blog-callout unknown-class" onclick="alert(1)" style="color:red">
  <script>alert(1)</script>
  <a href="javascript:alert(1)" onmouseover="alert(2)">Link</a>
  <img src="/lovable-uploads/grafico.png" onerror="alert(3)" alt="Grafico">
</div>
`);
    const doc = parseHtml(html);
    const callout = doc.querySelector("div");
    const link = doc.querySelector("a");
    const image = doc.querySelector("img");

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("javascript:alert");
    expect(callout?.getAttribute("class")).toBe("blog-callout");
    expect(callout?.hasAttribute("style")).toBe(false);
    expect(callout?.hasAttribute("onclick")).toBe(false);
    expect(link?.getAttribute("href")).toBe("#");
    expect(link?.hasAttribute("onmouseover")).toBe(false);
    expect(image?.getAttribute("src")).toBe(`${TEST_PUBLIC_ORIGIN}/lovable-uploads/grafico.png`);
    expect(image?.hasAttribute("onerror")).toBe(false);
    expectNoHtmlToken(html);
  });

  it("renders long editorial content without duplicating list numbering", () => {
    const sections = Array.from({ length: 20 }, (_section, index) => `
## Secao ${index + 1}

### Subsecao ${index + 1}

${Array.from({ length: 55 }, (_p, pIndex) => `Paragrafo ${index + 1}.${pIndex + 1} com conteudo suficiente para simular artigo longo.`).join("\n\n")}

1. Diagnostico ${index + 1}
2. Execucao ${index + 1}

<div class="blog-step-card">
  <span>${String(index + 1).padStart(2, "0")}</span>
  <div><strong>Etapa ${index + 1}</strong><p>Texto da etapa.</p></div>
</div>
`).join("\n\n");

    const images = Array.from({ length: 5 }, (_image, index) => `
<figure>
  <img src="/lovable-uploads/imagem-${index + 1}.png" alt="Imagem ${index + 1}">
  <figcaption>Legenda da imagem ${index + 1}.</figcaption>
</figure>
`).join("\n");
    const tables = Array.from({ length: 3 }, (_table, index) => `
| Criterio ${index + 1} | Estrategia | Execucao |
| --- | --- | --- |
| Foco | Longo prazo | Rotina |
| Indicador | Receita | Conversao |
`).join("\n");
    const statGrids = Array.from({ length: 2 }, (_grid, index) => `
<div class="blog-stat-grid">
  <div class="blog-stat-card"><strong>${70 + index}%</strong><span>texto da estatistica</span></div>
  <div class="blog-stat-card"><strong>${79 + index}%</strong><span>texto da estatistica</span></div>
</div>
`).join("\n");
    const callouts = Array.from({ length: 3 }, (_callout, index) => `
<div class="blog-callout"><strong>Ideia central ${index + 1}:</strong> destaque do artigo.</div>
`).join("\n");
    const ctas = Array.from({ length: 2 }, (_cta, index) => `
<div class="blog-material-card">
  <span>Material complementar</span>
  <strong>Framework ${index + 1}</strong>
  <p>Acesse gratuitamente a biblioteca de materiais.</p>
  <a href="/biblioteca">Ver biblioteca</a>
</div>
`).join("\n");
    const content = `
${sections}

${images}
${tables}
${statGrids}
${callouts}
${ctas}
`;
    const html = contentToHtml(content);
    const doc = parseHtml(html);

    expect(doc.querySelectorAll("h2").length).toBeGreaterThanOrEqual(20);
    expect(doc.querySelectorAll("figure img")).toHaveLength(5);
    expect(doc.querySelectorAll(".blog-table-wrap table")).toHaveLength(3);
    expect(doc.querySelectorAll(".blog-step-card")).toHaveLength(20);
    expect(doc.querySelectorAll(".blog-stat-grid")).toHaveLength(2);
    expect(doc.querySelectorAll(".blog-callout")).toHaveLength(3);
    expect(doc.querySelectorAll(".blog-material-card")).toHaveLength(2);
    expect(doc.querySelectorAll("ol.blog-numbered-list")).toHaveLength(20);
    expect(html).not.toContain("blog-loose-step-number");
  });
});
