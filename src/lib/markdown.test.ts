import { describe, expect, it } from "vitest";
import { contentToHtml } from "./markdown";

describe("contentToHtml special blog blocks", () => {
  it("renders markdown h2 and h3 headings with stable ids", () => {
    const html = contentToHtml(`
## O que e crescimento previsivel?

Texto normal.

### Primeiro passo

Mais texto.
`);

    expect(html).toContain(
      '<h2 id="o-que-e-crescimento-previsivel">O que e crescimento previsivel?</h2>',
    );
    expect(html).toContain('<h3 id="primeiro-passo">Primeiro passo</h3>');
    expect(html).not.toContain("## O que e crescimento previsivel?");
    expect(html).not.toContain("### Primeiro passo");
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
        "<p>## O que e crescimento previsivel?</p>",
        "<p>Texto normal.</p>",
        "<p>[bloco-destaque]</p>",
        "<p>Texto importante.</p>",
        "<p>[/bloco-destaque]</p>",
        "<p>### Primeiro passo</p>",
        "<p>Mais texto.</p>",
      ].join(""),
    );

    expect(html).toContain(
      '<h2 id="o-que-e-crescimento-previsivel">O que e crescimento previsivel?</h2>',
    );
    expect(html).toContain('<h3 id="primeiro-passo">Primeiro passo</h3>');
    expect(html).toContain('class="not-prose blog-special-block blog-special-highlight"');
    expect(html).toContain("<p>Texto normal.</p>");
    expect(html).toContain("<p>Mais texto.</p>");
    expect(html).not.toContain("## O que e crescimento previsivel?");
    expect(html).not.toContain("### Primeiro passo");
    expect(html).not.toContain("[/bloco-destaque]");
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
