import { describe, expect, it } from "vitest";
import { contentToHtml } from "./markdown";

function parseHtml(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("contentToHtml special blog blocks", () => {
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

  it("keeps incomplete blocks as safe text", () => {
    const html = contentToHtml(`[material titulo="Guia"]\nTexto sem fechamento.`);

    expect(html).toContain("[material titulo=&quot;Guia&quot;]");
    expect(html).toContain("Texto sem fechamento.");
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
});
