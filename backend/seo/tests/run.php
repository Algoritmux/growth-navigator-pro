<?php

declare(strict_types=1);

/**
 * Testes do SEO server-side, sem banco e sem dependências.
 * Uso: php backend/seo/tests/run.php
 */

// A pasta backend/ vai inteira para o servidor; pelo navegador este arquivo não roda.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../routes.php';

$failures = 0;
$passes = 0;

function check(bool $condition, string $label): void
{
    global $failures, $passes;
    if ($condition) {
        $passes++;
        return;
    }
    $failures++;
    fwrite(STDERR, "FALHOU: {$label}\n");
}

function countMatches(string $pattern, string $html): int
{
    return preg_match_all($pattern, $html);
}

$index = <<<'HTML'
<!doctype html>
<html lang="pt-BR">
  <head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-8PJTEYT1PV"></script>
    <meta charset="UTF-8" />
    <link rel="canonical" href="https://guilhermecorreia.com.br/" />
    <title>Guilherme Correia | Growth, IA e Crescimento Previsível</title>
    <meta
      name="description"
      content="Estratégias práticas sobre growth."
    />
    <meta property="og:title" content="Guilherme Correia | Growth" />
    <meta property="og:description" content="Estratégias práticas." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://guilhermecorreia.com.br/" />
    <meta property="og:image" content="https://guilhermecorreia.com.br/og-image.png" />
    <meta name="twitter:title" content="Guilherme Correia | Growth" />
    <meta name="twitter:description" content="Estratégias práticas." />
    <meta name="twitter:image" content="https://guilhermecorreia.com.br/og-image.png" />
    <script type="module" crossorigin src="/assets/index-abc123.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-abc123.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
HTML;

$now = new DateTimeImmutable('2026-10-29 10:00:00', new DateTimeZone('America/Sao_Paulo'));

$content = <<<'MD'
<!-- blog-cover-image: /lovable-uploads/capa-gtm.jpg -->
<div class="blog-lead">
  Crescer com previsibilidade começa pelo ICP.
</div>

## Por que bons produtos travam

Texto com **negrito**, *itálico* e um [link interno](/servicos) e [externo](https://exemplo.com).
Link perigoso: [clique](javascript:alert(1)) e custo < receita.

- Primeiro item
- Segundo item

1. Passo um
2. Passo dois

[bloco-destaque titulo="Ideia"]
Conteúdo do destaque.
[/bloco-destaque]

[imagem src="/lovable-uploads/grafico.png" alt="Gráfico de funil" legenda="Funil"]

| Etapa | Meta |
| --- | --- |
| Lead | 100 |

<script>alert('xss')</script>
<img src="x" onerror="alert(1)">
<a href="/biblioteca" onclick="steal()">Ver biblioteca</a>
MD;

$posts = [
    'go-to-market-b2b' => [
        'slug' => 'go-to-market-b2b',
        'title' => 'Go-to-market B2B: guia & passos',
        'excerpt' => 'Como lançar um produto B2B com previsibilidade de receita.',
        'content' => $content,
        'category' => 'GTM',
        'tags_json' => '["GTM","B2B"]',
        'is_published' => 1,
        'published_at' => '2026-10-20 09:00:00',
        'updated_at' => '2026-10-21 14:30:00',
    ],
    'rascunho' => [
        'slug' => 'rascunho', 'title' => 'Rascunho', 'excerpt' => '', 'content' => 'x', 'category' => 'IA',
        'tags_json' => null, 'is_published' => 0, 'published_at' => '2026-10-01 09:00:00', 'updated_at' => '2026-10-01 09:00:00',
    ],
    'agendado' => [
        'slug' => 'agendado', 'title' => 'Agendado', 'excerpt' => '', 'content' => 'x', 'category' => 'IA',
        'tags_json' => null, 'is_published' => 1, 'published_at' => '2026-11-05 09:00:00', 'updated_at' => '2026-10-28 09:00:00',
    ],
    'xss' => [
        'slug' => 'xss', 'title' => 'Título </script><script>alert(1)</script>', 'excerpt' => 'Resumo "com aspas" <b>', 'content' => 'Oi',
        'category' => 'IA', 'tags_json' => '[]', 'is_published' => 1, 'published_at' => '2026-10-02 09:00:00', 'updated_at' => '2026-10-02 09:00:00',
    ],
];

$materials = [
    'framework-growth' => [
        'slug' => 'framework-growth', 'title' => 'Framework de Growth', 'description' => 'Um framework prático.',
        'cover_image' => 'data:image/png;base64,AAAA', 'updated_at' => '2026-09-01 10:00:00',
    ],
];

$loaders = [
    'post' => static fn (string $slug): ?array => $posts[$slug] ?? null,
    'posts' => static fn (): array => [$posts['go-to-market-b2b'], $posts['xss']],
    'material' => static fn (string $slug): ?array => $materials[$slug] ?? null,
    'materials' => static fn (): array => array_values($materials),
];

// Post publicado.
$result = seoHandleRequest('/blog/go-to-market-b2b?utm_source=x', $index, $loaders, $now);
$html = $result['html'];
check($result['status'] === 200, 'post: status 200');
check(str_contains($html, '<title>Go-to-market B2B: guia &amp; passos | Guilherme Correia</title>'), 'post: title');
check(countMatches('#<title>#', $html) === 1, 'post: um único title');
check(str_contains($html, '<link rel="canonical" href="https://guilhermecorreia.com.br/blog/go-to-market-b2b" />'), 'post: canonical');
check(countMatches('#rel="canonical"#', $html) === 1, 'post: um único canonical');
check(str_contains($html, '<meta property="og:url" content="https://guilhermecorreia.com.br/blog/go-to-market-b2b" />'), 'post: og:url');
check(str_contains($html, '<meta property="og:type" content="article" />'), 'post: og:type article');
check(str_contains($html, '<meta property="og:image" content="https://guilhermecorreia.com.br/lovable-uploads/capa-gtm.jpg" />'), 'post: og:image da capa');
check(str_contains($html, '<meta name="description" content="Como lançar um produto B2B com previsibilidade de receita." />'), 'post: description');
check(countMatches('#name="description"#', $html) === 1, 'post: uma única description');
check(countMatches('#property="og:title"#', $html) === 1, 'post: um único og:title');
check(str_contains($html, '<meta property="article:published_time" content="2026-10-20T09:00:00-03:00" />'), 'post: published_time com fuso');
check(str_contains($html, '"@type":"BlogPosting"') && str_contains($html, '"@type":"BreadcrumbList"'), 'post: JSON-LD BlogPosting + Breadcrumb');
check(str_contains($html, '"dateModified":"2026-10-21T14:30:00-03:00"'), 'post: dateModified');
check(str_contains($html, 'id="seo-json-ld"'), 'post: id do JSON-LD igual ao SEO.tsx');
check(str_contains($html, '<script type="module" crossorigin src="/assets/index-abc123.js"></script>'), 'post: bundle do Vite preservado');
check(str_contains($html, 'googletagmanager.com/gtag/js?id=G-8PJTEYT1PV'), 'post: GA4 preservado');
check(str_contains($html, '<h1>Go-to-market B2B: guia &amp; passos</h1>'), 'post: h1');
check(countMatches('#<h1\b#', $html) === 1, 'post: um único h1');
check(str_contains($html, '<h2>Por que bons produtos travam</h2>'), 'post: h2 do markdown');
check(str_contains($html, '<strong>negrito</strong>') && str_contains($html, '<em>itálico</em>'), 'post: negrito e itálico');
check(str_contains($html, '<a href="/servicos">link interno</a>'), 'post: link interno');
check(str_contains($html, '<ul><li>') || str_contains($html, "<ul>\n<li>"), 'post: lista');
check(str_contains($html, '<ol>'), 'post: lista numerada');
check(str_contains($html, '<th>Etapa</th>') && str_contains($html, '<td>100</td>'), 'post: tabela');
check(str_contains($html, '<img src="/lovable-uploads/grafico.png" alt="Gráfico de funil" loading="lazy">'), 'post: bloco [imagem]');
check(str_contains($html, 'Crescer com previsibilidade começa pelo ICP.'), 'post: texto dentro de div do editor');
check(str_contains($html, 'Conteúdo do destaque.') && !str_contains($html, '[bloco-destaque'), 'post: marcador de bloco removido, texto mantido');
check(str_contains($html, 'custo &lt; receita'), 'post: < solto vira texto');
check(!str_contains($html, "alert('xss')") && !str_contains($html, 'onerror') && !str_contains($html, 'onclick'), 'post: script e eventos removidos');
check(!str_contains($html, 'javascript:'), 'post: link javascript removido');
check(str_contains($html, '<a href="/biblioteca">Ver biblioteca</a>'), 'post: link HTML mantido sem onclick');
check(!str_contains($html, 'blog-cover-image'), 'post: comentário de capa não vaza');
check(!str_contains($html, 'name="robots"'), 'post: sem noindex');

// Barra final e acentos na URL.
$result = seoHandleRequest('/blog/go-to-market-b2b/', $index, $loaders, $now);
check(str_contains($result['html'], 'href="https://guilhermecorreia.com.br/blog/go-to-market-b2b" />'), 'barra final: canonical sem barra');

// Rascunho e agendado não aparecem.
foreach (['rascunho', 'agendado', 'nao-existe'] as $slug) {
    $result = seoHandleRequest('/blog/' . $slug, $index, $loaders, $now);
    check($result['status'] === 404, "{$slug}: status 404");
    check(str_contains($result['html'], '<meta name="robots" content="noindex, follow" />'), "{$slug}: noindex");
    check(!str_contains($result['html'], '<h1>'), "{$slug}: sem conteúdo");
    check(str_contains($result['html'], '<div id="root"></div>'), "{$slug}: root vazio para o React");
}

// XSS em título e resumo.
$result = seoHandleRequest('/blog/xss', $index, $loaders, $now);
$html = $result['html'];
check(!str_contains($html, '<script>alert(1)</script>'), 'xss: título não injeta script');
check(str_contains($html, '</script>') || !str_contains(strstr($html, 'seo-json-ld') ?: '', '</script><script>'), 'xss: JSON-LD com </script> escapado');
check(str_contains($html, '<meta name="description" content="Resumo &quot;com aspas&quot;" />'), 'xss: description escapada e sem tags');
check(str_contains(seoContentToHtml("# Título interno\n\n### Subseção"), '<h2>Título interno</h2>'), 'markdown: # vira h2');
check(str_contains(seoContentToHtml("### Subseção"), '<h3>Subseção</h3>'), 'markdown: ### vira h3');

// Lista do blog.
$result = seoHandleRequest('/blog', $index, $loaders, $now);
$html = $result['html'];
check($result['status'] === 200, 'blog: 200');
check(str_contains($html, '<title>Blog | Guilherme Correia</title>'), 'blog: title');
check(str_contains($html, 'href="https://guilhermecorreia.com.br/blog" />'), 'blog: canonical');
check(str_contains($html, '<a href="/blog/go-to-market-b2b">'), 'blog: link para o post');
check(!str_contains($html, '/blog/rascunho'), 'blog: rascunho fora da lista');

// Serviços, biblioteca e material.
$result = seoHandleRequest('/servicos', $index, $loaders, $now);
check(str_contains($result['html'], 'href="https://guilhermecorreia.com.br/servicos" />'), 'servicos: canonical');
$result = seoHandleRequest('/biblioteca', $index, $loaders, $now);
check(str_contains($result['html'], '<a href="/biblioteca/framework-growth">'), 'biblioteca: link do material');
$result = seoHandleRequest('/biblioteca/framework-growth', $index, $loaders, $now);
check(str_contains($result['html'], '<title>Framework de Growth | Guilherme Correia</title>'), 'material: title');
check(str_contains($result['html'], 'property="og:image" content="https://guilhermecorreia.com.br/og-image.png"'), 'material: capa data: não vira og:image');
$result = seoHandleRequest('/biblioteca/nao-existe', $index, $loaders, $now);
check($result['status'] === 404, 'material inexistente: 404');

// Rotas fora do escopo e falhas devolvem o index intacto.
foreach (['/', '/admin/blog', '/login', '/qualquer'] as $path) {
    $result = seoHandleRequest($path, $index, $loaders, $now);
    check($result['html'] === $index && $result['status'] === 200, "{$path}: index intacto");
}
$broken = $loaders;
$broken['post'] = static function (string $slug): ?array {
    throw new RuntimeException('banco fora');
};
$result = @seoHandleRequest('/blog/go-to-market-b2b', $index, $broken, $now);
check($result['html'] === $index && $result['status'] === 200, 'falha no banco: index intacto');

// Sitemap.
$xml = seoSitemapXml($loaders['posts'](), $loaders['materials']());
check(str_contains($xml, '<loc>https://guilhermecorreia.com.br/blog/go-to-market-b2b</loc><lastmod>2026-10-21T14:30:00-03:00</lastmod>'), 'sitemap: post com lastmod');
check(str_contains($xml, '<loc>https://guilhermecorreia.com.br/biblioteca/framework-growth</loc>'), 'sitemap: material');
check(str_contains($xml, '<loc>https://guilhermecorreia.com.br/</loc>'), 'sitemap: home');
check(!str_contains($xml, 'rascunho') && !str_contains($xml, 'agendado'), 'sitemap: sem rascunho nem agendado');
$doc = new DOMDocument();
check(@$doc->loadXML($xml) === true, 'sitemap: XML válido');
check(@$doc->loadXML(seoSitemapXml([], [])) === true, 'sitemap vazio: XML válido');

echo "{$passes} verificações ok, {$failures} falhas\n";
exit($failures === 0 ? 0 : 1);
