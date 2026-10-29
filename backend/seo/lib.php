<?php

declare(strict_types=1);

/**
 * Funções puras de SEO server-side.
 *
 * Nada aqui acessa banco ou rede: recebem arrays/strings e devolvem strings,
 * para poderem ser testadas isoladamente (backend/seo/tests/run.php).
 */

const SEO_SITE_URL = 'https://guilhermecorreia.com.br';
const SEO_SITE_NAME = 'Guilherme Correia';
const SEO_DEFAULT_TITLE = 'Guilherme Correia | Growth, IA e Crescimento Previsível';
const SEO_DEFAULT_DESCRIPTION = 'Estratégias práticas sobre growth, marketing, vendas, dados e inteligência artificial para construir crescimento previsível.';
const SEO_DEFAULT_IMAGE = SEO_SITE_URL . '/og-image.png';
const SEO_TIMEZONE = 'America/Sao_Paulo';

const SEO_ALLOWED_TAGS = [
    'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a', 'img',
    'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'br', 'div', 'span', 'code',
];

function seoEscape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
}

function seoAbsoluteUrl(string $pathOrUrl): string
{
    $value = trim($pathOrUrl);
    if ($value === '') {
        return '';
    }
    if (preg_match('#^https?://#i', $value) === 1) {
        return $value;
    }
    if (str_starts_with($value, '/')) {
        return SEO_SITE_URL . $value;
    }

    return '';
}

function seoIsSafeUrl(string $url, bool $image = false): bool
{
    $value = trim($url);
    if ($value === '') {
        return false;
    }
    if (preg_match('#^(https?://|/)#i', $value) === 1) {
        return true;
    }

    return !$image && preg_match('#^mailto:#i', $value) === 1;
}

/** Texto puro, sem tags e com espaços normalizados, cortado em $limit caracteres. */
function seoPlainText(string $html, int $limit = 0): string
{
    $text = html_entity_decode(strip_tags(preg_replace('#<(br|/p|/li|/h\d|/div)\b[^>]*>#i', ' ', $html) ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = trim((string) preg_replace('/\s+/u', ' ', $text));

    if ($limit > 0 && mb_strlen($text) > $limit) {
        $cut = mb_substr($text, 0, $limit - 1);
        $lastSpace = mb_strrpos($cut, ' ');
        if ($lastSpace !== false && $lastSpace > $limit * 0.6) {
            $cut = mb_substr($cut, 0, $lastSpace);
        }
        $text = rtrim($cut, " ,.;:-") . '…';
    }

    return $text;
}

/** Capa gravada pelo editor como comentário no início do conteúdo. */
function seoExtractCoverImage(string $content): string
{
    if (preg_match('/^\s*<!--\s*blog-cover-image:\s*([^\n\r]*?)\s*-->/i', $content, $match) === 1) {
        $src = trim($match[1]);
        return seoIsSafeUrl($src, true) ? $src : '';
    }

    return '';
}

function seoExtractFirstImage(string $content): string
{
    if (preg_match('/<img\b[^>]*\bsrc=(["\'])(.*?)\1/i', $content, $match) === 1 && seoIsSafeUrl($match[2], true)) {
        return $match[2];
    }
    if (preg_match('/!\[[^\]]*\]\(([^)\s]+)/', $content, $match) === 1 && seoIsSafeUrl($match[1], true)) {
        return $match[1];
    }
    if (preg_match('/\[imagem\b[^\]]*\bsrc=(["\'])(.*?)\1/i', $content, $match) === 1 && seoIsSafeUrl($match[2], true)) {
        return $match[2];
    }

    return '';
}

function seoInlineMarkdown(string $text): string
{
    $text = (string) preg_replace_callback(
        '/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/',
        static fn (array $m): string => seoIsSafeUrl($m[2], true)
            ? '<img src="' . seoEscape($m[2]) . '" alt="' . seoEscape($m[1]) . '">'
            : '',
        $text
    );
    $text = (string) preg_replace_callback(
        '/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/',
        static fn (array $m): string => seoIsSafeUrl($m[2])
            ? '<a href="' . seoEscape($m[2]) . '">' . $m[1] . '</a>'
            : $m[1],
        $text
    );
    $text = (string) preg_replace('/\*\*(.+?)\*\*|__(.+?)__/', '<strong>$1$2</strong>', $text);
    $text = (string) preg_replace('/(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])/', '<em>$1</em>', $text);
    $text = (string) preg_replace('/`([^`]+)`/', '<code>$1</code>', $text);

    return $text;
}

/**
 * Converte o conteúdo do post (Markdown + HTML controlado + blocos do editor)
 * em HTML semântico e seguro para o HTML inicial servido aos buscadores.
 * A página React substitui esse HTML ao carregar, então o objetivo aqui é
 * texto, títulos, listas, tabelas, links e imagens corretos, não o visual.
 */
function seoContentToHtml(string $content): string
{
    $content = str_replace(["\r\n", "\r"], "\n", $content);
    $content = (string) preg_replace('/<!--.*?-->/s', '', $content);
    $content = (string) preg_replace('#<(script|style|iframe|object|embed|noscript|template)\b.*?</\1\s*>#is', '', $content);

    $lines = explode("\n", $content);
    $out = [];
    $paragraph = [];
    $listType = null;
    $count = count($lines);

    $flushParagraph = static function () use (&$paragraph, &$out): void {
        if ($paragraph !== []) {
            $out[] = '<p>' . seoInlineMarkdown(implode(' ', $paragraph)) . '</p>';
            $paragraph = [];
        }
    };
    $closeList = static function () use (&$listType, &$out): void {
        if ($listType !== null) {
            $out[] = '</' . $listType . '>';
            $listType = null;
        }
    };

    for ($i = 0; $i < $count; $i++) {
        $line = trim($lines[$i]);

        if ($line === '') {
            $flushParagraph();
            $closeList();
            continue;
        }

        // Marcadores de bloco do editor ([bloco-destaque], [/passo], [imagem ...]).
        if (preg_match('/^\[imagem\b([^\]]*)\]$/i', $line, $m) === 1) {
            $flushParagraph();
            $closeList();
            if (preg_match('/\bsrc=(["\'])(.*?)\1/i', $m[1], $src) === 1 && seoIsSafeUrl($src[2], true)) {
                $alt = preg_match('/\balt=(["\'])(.*?)\1/i', $m[1], $altMatch) === 1 ? $altMatch[2] : '';
                $out[] = '<figure><img src="' . seoEscape($src[2]) . '" alt="' . seoEscape($alt) . '"></figure>';
            }
            continue;
        }
        if (preg_match('/^\[\/?[a-z][a-z-]*\b[^\]]*\]$/i', $line) === 1) {
            $flushParagraph();
            $closeList();
            continue;
        }

        if (preg_match('/^(#{1,4})\s+(.+)$/', $line, $m) === 1) {
            $flushParagraph();
            $closeList();
            // Mesmo nível do markdown.ts (## = h2, ### = h3); "#" vira h2 porque o h1 é o título do post.
            $level = max(2, min(4, strlen($m[1])));
            $out[] = "<h{$level}>" . seoInlineMarkdown(rtrim($m[2], ' #')) . "</h{$level}>";
            continue;
        }

        if (str_starts_with($line, '|') && $i + 1 < $count && preg_match('/^\|?\s*:?-{3,}/', trim($lines[$i + 1])) === 1) {
            $flushParagraph();
            $closeList();
            $parseRow = static fn (string $row): array => array_map('trim', explode('|', trim(trim($row), '|')));
            $headers = $parseRow($line);
            $html = '<table><thead><tr>';
            foreach ($headers as $header) {
                $html .= '<th>' . seoInlineMarkdown($header) . '</th>';
            }
            $html .= '</tr></thead><tbody>';
            $i += 2;
            while ($i < $count && str_starts_with(trim($lines[$i]), '|')) {
                $cells = $parseRow($lines[$i]);
                $html .= '<tr>';
                foreach (array_keys($headers) as $index) {
                    $html .= '<td>' . seoInlineMarkdown($cells[$index] ?? '') . '</td>';
                }
                $html .= '</tr>';
                $i++;
            }
            $i--;
            $out[] = $html . '</tbody></table>';
            continue;
        }

        if (preg_match('/^([-*+]|\d+[.)])\s+(.+)$/', $line, $m) === 1) {
            $flushParagraph();
            $type = ctype_digit(rtrim($m[1], '.)')) ? 'ol' : 'ul';
            if ($listType !== $type) {
                $closeList();
                $out[] = '<' . $type . '>';
                $listType = $type;
            }
            $out[] = '<li>' . seoInlineMarkdown($m[2]) . '</li>';
            continue;
        }

        if (preg_match('/^>\s?(.*)$/', $line, $m) === 1) {
            $flushParagraph();
            $closeList();
            $out[] = '<blockquote>' . seoInlineMarkdown($m[1]) . '</blockquote>';
            continue;
        }

        // Linha que já é HTML de bloco passa direto (sanitizada abaixo).
        if (preg_match('#^</?(div|figure|figcaption|table|thead|tbody|tr|th|td|ul|ol|li|h[1-6]|p|blockquote|img|section)\b#i', $line) === 1) {
            $flushParagraph();
            $closeList();
            $out[] = seoInlineMarkdown($line);
            continue;
        }

        $closeList();
        $paragraph[] = $line;
    }

    $flushParagraph();
    $closeList();

    return seoSanitizeHtml(implode("\n", $out));
}

/** Mantém só tags permitidas e só os atributos href/src/alt seguros. */
function seoSanitizeHtml(string $html): string
{
    $allowed = implode('|', SEO_ALLOWED_TAGS);

    // Títulos h1 no corpo viram h2: a página tem um único h1 (o título do post).
    $html = (string) preg_replace('#<(/?)h1\b#i', '<$1h2', $html);
    $html = (string) preg_replace('#<(/?)(h[56])\b#i', '<$1h4', $html);

    // "<" que não abre uma tag permitida é texto ("custo < receita").
    $html = (string) preg_replace('#<(?!/?(?:' . $allowed . ')\b)#i', '&lt;', $html);

    return (string) preg_replace_callback(
        '#<(/?)(' . $allowed . ')\b([^>]*)>#i',
        static function (array $m): string {
            $tag = strtolower($m[2]);
            if ($m[1] === '/') {
                return in_array($tag, ['img', 'br'], true) ? '' : '</' . $tag . '>';
            }

            $attributes = '';
            if ($tag === 'a' && preg_match('/\bhref\s*=\s*(["\'])(.*?)\1/i', $m[3], $href) === 1 && seoIsSafeUrl(html_entity_decode($href[2]))) {
                $attributes .= ' href="' . seoEscape(html_entity_decode($href[2])) . '"';
            }
            if ($tag === 'img') {
                if (preg_match('/\bsrc\s*=\s*(["\'])(.*?)\1/i', $m[3], $src) !== 1 || !seoIsSafeUrl(html_entity_decode($src[2]), true)) {
                    return '';
                }
                $attributes .= ' src="' . seoEscape(html_entity_decode($src[2])) . '"';
                $alt = preg_match('/\balt\s*=\s*(["\'])(.*?)\1/i', $m[3], $altMatch) === 1 ? html_entity_decode($altMatch[2]) : '';
                $attributes .= ' alt="' . seoEscape($alt) . '" loading="lazy"';
            }

            return '<' . $tag . $attributes . '>';
        },
        $html
    );
}

function seoDecodeTags(?string $tagsJson): array
{
    $tags = json_decode((string) $tagsJson, true);
    if (!is_array($tags)) {
        return [];
    }

    return array_values(array_filter(array_map(static fn ($tag): string => trim((string) $tag), $tags), static fn (string $tag): bool => $tag !== ''));
}

/** Data do banco (horário de São Paulo) em ISO 8601 com fuso. */
function seoIsoDate(?string $value): string
{
    if ($value === null || trim($value) === '') {
        return '';
    }
    try {
        return (new DateTimeImmutable($value, new DateTimeZone(SEO_TIMEZONE)))->format(DATE_ATOM);
    } catch (Throwable) {
        return '';
    }
}

/** Visível ao público: publicado e com data de publicação já passada. */
function seoIsPublicPost(array $post, ?DateTimeImmutable $now = null): bool
{
    if ((int) ($post['is_published'] ?? 0) !== 1) {
        return false;
    }
    $publishedAt = trim((string) ($post['published_at'] ?? ''));
    if ($publishedAt === '') {
        return false;
    }
    $now ??= new DateTimeImmutable('now', new DateTimeZone(SEO_TIMEZONE));

    return $publishedAt <= $now->format('Y-m-d H:i:s');
}

function seoPerson(): array
{
    return [
        '@type' => 'Person',
        '@id' => SEO_SITE_URL . '/#guilherme-correia',
        'name' => SEO_SITE_NAME,
        'url' => SEO_SITE_URL . '/',
    ];
}

function seoBreadcrumb(array $items): array
{
    $list = [];
    foreach ($items as $index => [$name, $path]) {
        $list[] = [
            '@type' => 'ListItem',
            'position' => $index + 1,
            'name' => $name,
            'item' => SEO_SITE_URL . $path,
        ];
    }

    return [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => $list,
    ];
}

function seoBreadcrumbHtml(array $items): string
{
    $links = [];
    foreach ($items as [$name, $path]) {
        $links[] = '<a href="' . seoEscape($path) . '">' . seoEscape($name) . '</a>';
    }

    return '<nav aria-label="breadcrumb">' . implode(' › ', $links) . '</nav>';
}

/**
 * Metadados de página. Chaves: title, description, path, image, type,
 * noindex, jsonLd (array), extraMeta (lista de [property, content]), body, status.
 */
function seoPage(array $values): array
{
    return array_merge([
        'title' => SEO_DEFAULT_TITLE,
        'description' => SEO_DEFAULT_DESCRIPTION,
        'path' => '/',
        'image' => SEO_DEFAULT_IMAGE,
        'type' => 'website',
        'noindex' => false,
        'jsonLd' => [],
        'extraMeta' => [],
        'body' => '',
        'status' => 200,
    ], $values);
}

function seoPostPage(array $post): array
{
    $slug = (string) $post['slug'];
    $path = '/blog/' . rawurlencode($slug);
    $title = trim((string) $post['title']);
    $content = (string) ($post['content'] ?? '');
    $excerpt = trim((string) ($post['excerpt'] ?? ''));
    $description = seoPlainText($excerpt !== '' ? $excerpt : seoContentToHtml($content), 160);
    $image = seoAbsoluteUrl(seoExtractCoverImage($content) ?: seoExtractFirstImage($content)) ?: SEO_DEFAULT_IMAGE;
    $published = seoIsoDate($post['published_at'] ?? null);
    $modified = seoIsoDate($post['updated_at'] ?? null) ?: $published;
    $tags = seoDecodeTags($post['tags_json'] ?? null);
    $crumbs = [['Início', '/'], ['Blog', '/blog'], [$title, $path]];
    $url = SEO_SITE_URL . $path;

    $article = [
        '@context' => 'https://schema.org',
        '@type' => 'BlogPosting',
        'headline' => $title,
        'description' => $description,
        'url' => $url,
        'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $url],
        'image' => [$image],
        'author' => seoPerson(),
        'publisher' => seoPerson(),
        'datePublished' => $published,
        'dateModified' => $modified,
        'inLanguage' => 'pt-BR',
    ];
    if (!empty($post['category'])) {
        $article['articleSection'] = (string) $post['category'];
    }
    if ($tags !== []) {
        $article['keywords'] = implode(', ', $tags);
    }

    $extraMeta = [['article:published_time', $published], ['article:modified_time', $modified]];
    if (!empty($post['category'])) {
        $extraMeta[] = ['article:section', (string) $post['category']];
    }

    $body = '<main class="seo-prerender"><article>'
        . seoBreadcrumbHtml($crumbs)
        . '<h1>' . seoEscape($title) . '</h1>'
        . ($excerpt !== '' ? '<p>' . seoEscape($excerpt) . '</p>' : '')
        . seoContentToHtml($content)
        . '</article></main>';

    return seoPage([
        'title' => $title . ' | ' . SEO_SITE_NAME,
        'description' => $description,
        'path' => $path,
        'image' => $image,
        'type' => 'article',
        'jsonLd' => [$article, seoBreadcrumb($crumbs)],
        'extraMeta' => $extraMeta,
        'body' => $body,
    ]);
}

function seoBlogIndexPage(array $posts): array
{
    $items = '';
    $listElements = [];
    foreach (array_values($posts) as $index => $post) {
        $path = '/blog/' . rawurlencode((string) $post['slug']);
        $items .= '<li><a href="' . seoEscape($path) . '">' . seoEscape((string) $post['title']) . '</a>'
            . (!empty($post['excerpt']) ? '<p>' . seoEscape((string) $post['excerpt']) . '</p>' : '')
            . '</li>';
        $listElements[] = ['@type' => 'ListItem', 'position' => $index + 1, 'url' => SEO_SITE_URL . $path];
    }

    $description = 'Artigos sobre growth marketing, go-to-market, vendas B2B e inteligência artificial aplicada a empresas, por Guilherme Correia.';

    return seoPage([
        'title' => 'Blog | ' . SEO_SITE_NAME,
        'description' => $description,
        'path' => '/blog',
        'jsonLd' => [[
            '@context' => 'https://schema.org',
            '@type' => 'Blog',
            'name' => 'Blog de ' . SEO_SITE_NAME,
            'url' => SEO_SITE_URL . '/blog',
            'description' => $description,
            'author' => seoPerson(),
            'blogPost' => array_map(static fn (array $item): array => ['@type' => 'BlogPosting', 'url' => $item['url']], $listElements),
        ]],
        'body' => '<main class="seo-prerender"><h1>Blog</h1><p>' . seoEscape($description) . '</p>'
            . ($items !== '' ? '<ul>' . $items . '</ul>' : '') . '</main>',
    ]);
}

function seoServicesPage(): array
{
    $description = 'Mentoria executiva, palestras e consultoria de go-to-market para empresas que querem crescer com previsibilidade.';

    return seoPage([
        'title' => 'Serviços de Growth e IA | ' . SEO_SITE_NAME,
        'description' => $description,
        'path' => '/servicos',
        'body' => '<main class="seo-prerender"><h1>Serviços de Growth e IA</h1><p>' . seoEscape($description) . '</p></main>',
    ]);
}

function seoLibraryIndexPage(array $materials): array
{
    $items = '';
    foreach ($materials as $material) {
        if (empty($material['slug'])) {
            continue;
        }
        $items .= '<li><a href="/biblioteca/' . seoEscape(rawurlencode((string) $material['slug'])) . '">'
            . seoEscape((string) $material['title']) . '</a></li>';
    }
    $description = 'Biblioteca gratuita de livros, frameworks, guias e pesquisas sobre growth, go-to-market, vendas e inteligência artificial.';

    return seoPage([
        'title' => 'Biblioteca de materiais | ' . SEO_SITE_NAME,
        'description' => $description,
        'path' => '/biblioteca',
        'body' => '<main class="seo-prerender"><h1>Biblioteca de materiais</h1><p>' . seoEscape($description) . '</p>'
            . ($items !== '' ? '<ul>' . $items . '</ul>' : '') . '</main>',
    ]);
}

function seoMaterialPage(array $material): array
{
    $path = '/biblioteca/' . rawurlencode((string) $material['slug']);
    $title = trim((string) $material['title']);
    $descriptionText = trim((string) ($material['description'] ?? ''));
    $cover = trim((string) ($material['cover_image'] ?? ''));
    // Capas em data: URI não servem como og:image.
    $image = seoIsSafeUrl($cover, true) ? (seoAbsoluteUrl($cover) ?: SEO_DEFAULT_IMAGE) : SEO_DEFAULT_IMAGE;
    $crumbs = [['Início', '/'], ['Biblioteca', '/biblioteca'], [$title, $path]];

    return seoPage([
        'title' => $title . ' | ' . SEO_SITE_NAME,
        'description' => seoPlainText($descriptionText, 160) ?: SEO_DEFAULT_DESCRIPTION,
        'path' => $path,
        'image' => $image,
        'jsonLd' => [[
            '@context' => 'https://schema.org',
            '@type' => 'CreativeWork',
            'name' => $title,
            'description' => seoPlainText($descriptionText, 300),
            'url' => SEO_SITE_URL . $path,
            'image' => $image,
            'author' => seoPerson(),
            'inLanguage' => 'pt-BR',
        ], seoBreadcrumb($crumbs)],
        'body' => '<main class="seo-prerender"><article>' . seoBreadcrumbHtml($crumbs)
            . '<h1>' . seoEscape($title) . '</h1><p>' . seoEscape($descriptionText) . '</p></article></main>',
    ]);
}

function seoNotFoundPage(string $path): array
{
    return seoPage([
        'title' => 'Página não encontrada | ' . SEO_SITE_NAME,
        'path' => $path,
        'noindex' => true,
        'status' => 404,
    ]);
}

/** Troca (ou insere) uma meta tag identificada por name/property. */
function seoSetMeta(string $html, string $attribute, string $key, string $content): string
{
    $tag = '<meta ' . $attribute . '="' . seoEscape($key) . '" content="' . seoEscape($content) . '" />';
    $pattern = '#<meta\b(?=[^>]*\b' . $attribute . '\s*=\s*["\']' . preg_quote($key, '#') . '["\'])[^>]*>#is';

    if (preg_match($pattern, $html) === 1) {
        return (string) preg_replace_callback($pattern, static fn (): string => $tag, $html, 1);
    }

    return seoInsertBeforeHeadEnd($html, $tag);
}

function seoInsertBeforeHeadEnd(string $html, string $snippet): string
{
    $position = stripos($html, '</head>');
    if ($position === false) {
        return $html;
    }

    return substr($html, 0, $position) . '    ' . $snippet . "\n  " . substr($html, $position);
}

/** Injeta os metadados e o HTML do conteúdo no index.html gerado pelo Vite. */
function seoRenderDocument(string $indexHtml, array $page): string
{
    $html = $indexHtml;
    $title = (string) $page['title'];
    $description = (string) $page['description'];
    $url = SEO_SITE_URL . ($page['path'] === '/' ? '/' : rtrim((string) $page['path'], '/'));
    $image = (string) $page['image'];

    $html = (string) preg_replace_callback('#<title>.*?</title>#is', static fn (): string => '<title>' . seoEscape($title) . '</title>', $html, 1);

    $canonical = '<link rel="canonical" href="' . seoEscape($url) . '" />';
    $canonicalPattern = '#<link\b(?=[^>]*\brel\s*=\s*["\']canonical["\'])[^>]*>#is';
    $html = preg_match($canonicalPattern, $html) === 1
        ? (string) preg_replace_callback($canonicalPattern, static fn (): string => $canonical, $html, 1)
        : seoInsertBeforeHeadEnd($html, $canonical);

    $html = seoSetMeta($html, 'name', 'description', $description);
    $html = seoSetMeta($html, 'property', 'og:title', $title);
    $html = seoSetMeta($html, 'property', 'og:description', $description);
    $html = seoSetMeta($html, 'property', 'og:url', $url);
    $html = seoSetMeta($html, 'property', 'og:type', (string) $page['type']);
    $html = seoSetMeta($html, 'property', 'og:image', $image);
    $html = seoSetMeta($html, 'property', 'og:locale', 'pt_BR');
    $html = seoSetMeta($html, 'name', 'twitter:title', $title);
    $html = seoSetMeta($html, 'name', 'twitter:description', $description);
    $html = seoSetMeta($html, 'name', 'twitter:image', $image);

    foreach ($page['extraMeta'] as [$property, $content]) {
        if ((string) $content !== '') {
            $html = seoSetMeta($html, 'property', (string) $property, (string) $content);
        }
    }

    if ($page['noindex']) {
        $html = seoSetMeta($html, 'name', 'robots', 'noindex, follow');
    }

    if ($page['jsonLd'] !== []) {
        $json = json_encode(
            count($page['jsonLd']) === 1 ? $page['jsonLd'][0] : $page['jsonLd'],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP
        );
        // Mesmo id usado pelo componente SEO.tsx, que substitui este script ao carregar.
        $html = seoInsertBeforeHeadEnd($html, '<script type="application/ld+json" id="seo-json-ld">' . $json . '</script>');
    }

    if ($page['body'] !== '') {
        $html = seoInsertBeforeHeadEnd($html, '<style>.seo-prerender{max-width:760px;margin:0 auto;padding:96px 16px 48px;line-height:1.6}.seo-prerender img{max-width:100%;height:auto}</style>');
        $html = (string) preg_replace_callback(
            '#<div id="root">\s*</div>#i',
            static fn (): string => '<div id="root">' . $page['body'] . '</div>',
            $html,
            1
        );
    }

    return $html;
}
