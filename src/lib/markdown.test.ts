import { describe, expect, it } from "vitest";
import {
  contentToHtml,
  extractCoverImageSrc,
  extractFirstImageSrc,
  withCoverImageMeta,
} from "./markdown";

function parseHtml(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}

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
      "/lovable-uploads/exemplo.png",
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

    expect(doc.querySelector(".blog-special-image img")?.getAttribute("src")).toBe(
      "/lovable-uploads/grafico.png",
    );
    expect(doc.querySelector(".blog-special-image img")?.getAttribute("alt")).toBe(
      "Grafico de crescimento",
    );
    expect(doc.querySelector(".blog-special-image figcaption")?.textContent).toBe(
      "Legenda do grafico",
    );
    expect(html).not.toContain("<figure><img");
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
});
