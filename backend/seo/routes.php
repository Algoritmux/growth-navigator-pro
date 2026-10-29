<?php

declare(strict_types=1);

require_once __DIR__ . '/lib.php';

/**
 * Decide o que servir para cada rota pública.
 *
 * $loaders recebe funções que buscam dados (no servidor, consultas PDO; nos
 * testes, arrays fixos):
 *   - post(string $slug): ?array
 *   - posts(): array            posts públicos, mais recentes primeiro
 *   - material(string $slug): ?array
 *   - materials(): array        materiais publicados com slug
 *
 * Devolve ['status' => int, 'html' => string]. Rotas desconhecidas e qualquer
 * falha devolvem o index.html original com status 200, para nunca quebrar o
 * site: na pior hipótese a página se comporta exatamente como antes.
 */
function seoHandleRequest(string $requestUri, string $indexHtml, array $loaders, ?DateTimeImmutable $now = null): array
{
    $unchanged = ['status' => 200, 'html' => $indexHtml];
    $path = seoNormalizePath($requestUri);

    try {
        if ($path === '/blog') {
            $page = seoBlogIndexPage($loaders['posts']());
        } elseif (preg_match('#^/blog/([^/]+)$#', $path, $m) === 1) {
            $post = $loaders['post']($m[1]);
            $page = is_array($post) && seoIsPublicPost($post, $now)
                ? seoPostPage($post)
                : seoNotFoundPage($path);
        } elseif ($path === '/servicos') {
            $page = seoServicesPage();
        } elseif ($path === '/biblioteca') {
            $page = seoLibraryIndexPage($loaders['materials']());
        } elseif (preg_match('#^/biblioteca/([^/]+)$#', $path, $m) === 1) {
            $material = $loaders['material']($m[1]);
            $page = is_array($material) ? seoMaterialPage($material) : seoNotFoundPage($path);
        } else {
            return $unchanged;
        }

        return ['status' => (int) $page['status'], 'html' => seoRenderDocument($indexHtml, $page)];
    } catch (Throwable $error) {
        error_log('[seo] render falhou em ' . $path . ': ' . $error->getMessage());

        return $unchanged;
    }
}

/** Caminho decodificado, sem query string e sem barra final. */
function seoNormalizePath(string $requestUri): string
{
    $path = (string) (parse_url($requestUri, PHP_URL_PATH) ?? '/');
    $path = rawurldecode($path);
    $path = '/' . trim($path, '/');

    return $path;
}

function seoSitemapXml(array $posts, array $materials): string
{
    $entries = [
        ['/', null],
        ['/blog', $posts[0]['updated_at'] ?? null],
        ['/servicos', null],
        ['/biblioteca', null],
    ];
    foreach ($posts as $post) {
        $entries[] = ['/blog/' . rawurlencode((string) $post['slug']), $post['updated_at'] ?? $post['published_at'] ?? null];
    }
    foreach ($materials as $material) {
        if (!empty($material['slug'])) {
            $entries[] = ['/biblioteca/' . rawurlencode((string) $material['slug']), $material['updated_at'] ?? null];
        }
    }

    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
        . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach ($entries as [$path, $lastmod]) {
        $xml .= '  <url><loc>' . seoEscape(SEO_SITE_URL . $path) . '</loc>';
        $iso = seoIsoDate($lastmod);
        if ($iso !== '') {
            $xml .= '<lastmod>' . $iso . '</lastmod>';
        }
        $xml .= "</url>\n";
    }

    return $xml . "</urlset>\n";
}

/** Consultas reais, usadas por render.php e sitemap.php no servidor. */
function seoDatabaseLoaders(PDO $connection, ?DateTimeImmutable $now = null): array
{
    $now ??= new DateTimeImmutable('now', new DateTimeZone(SEO_TIMEZONE));
    $nowSql = $now->format('Y-m-d H:i:s');

    return [
        'post' => static function (string $slug) use ($connection): ?array {
            $statement = $connection->prepare(
                'SELECT slug, title, excerpt, content, category, tags_json, is_published, published_at, updated_at
                 FROM blog_posts WHERE slug = :slug LIMIT 1'
            );
            $statement->execute(['slug' => $slug]);
            $row = $statement->fetch(PDO::FETCH_ASSOC);

            return is_array($row) ? $row : null;
        },
        'posts' => static function () use ($connection, $nowSql): array {
            $statement = $connection->prepare(
                'SELECT slug, title, excerpt, published_at, updated_at
                 FROM blog_posts
                 WHERE is_published = 1 AND published_at <= :now
                 ORDER BY published_at DESC, id DESC'
            );
            $statement->execute(['now' => $nowSql]);

            return $statement->fetchAll(PDO::FETCH_ASSOC);
        },
        'material' => static function (string $slug) use ($connection): ?array {
            $statement = $connection->prepare(
                'SELECT slug, title, description, cover_image, updated_at
                 FROM materials WHERE slug = :slug AND is_published = 1 LIMIT 1'
            );
            $statement->execute(['slug' => $slug]);
            $row = $statement->fetch(PDO::FETCH_ASSOC);

            return is_array($row) ? $row : null;
        },
        'materials' => static function () use ($connection): array {
            $statement = $connection->query(
                "SELECT slug, title, updated_at FROM materials
                 WHERE is_published = 1 AND slug IS NOT NULL AND slug <> ''
                 ORDER BY id DESC"
            );

            return $statement->fetchAll(PDO::FETCH_ASSOC);
        },
    ];
}
