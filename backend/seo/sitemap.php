<?php

declare(strict_types=1);

/**
 * /sitemap.xml dinâmico: páginas fixas, posts públicos e materiais publicados.
 * Posts em rascunho ou agendados para o futuro não entram.
 * Sem banco, devolve ao menos as páginas fixas.
 */

require_once __DIR__ . '/routes.php';

$posts = [];
$materials = [];

try {
    require_once __DIR__ . '/../config/database.php';
    $loaders = seoDatabaseLoaders(getConnection());
    $posts = $loaders['posts']();
    $materials = $loaders['materials']();
} catch (Throwable $error) {
    error_log('[seo] sitemap sem banco: ' . $error->getMessage());
}

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');
echo seoSitemapXml($posts, $materials);
