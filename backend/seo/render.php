<?php

declare(strict_types=1);

/**
 * Serve o index.html do Vite com título, descrição, canonical, Open Graph,
 * JSON-LD e o conteúdo da página já no HTML, para buscadores e redes sociais.
 *
 * Acionado pelo .htaccess para /blog, /blog/{slug}, /servicos, /biblioteca e
 * /biblioteca/{slug}. O React carrega normalmente e substitui o conteúdo.
 * Se algo falhar (banco fora, arquivo ausente), devolve o index.html original.
 */

require_once __DIR__ . '/routes.php';

$indexPath = dirname(__DIR__, 2) . '/index.html';
$indexHtml = is_file($indexPath) ? (string) file_get_contents($indexPath) : '';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

if ($indexHtml === '') {
    http_response_code(500);
    error_log('[seo] index.html não encontrado em ' . $indexPath);
    echo '<!doctype html><title>Erro</title>';
    exit;
}

try {
    require_once __DIR__ . '/../config/database.php';
    $loaders = seoDatabaseLoaders(getConnection());
} catch (Throwable $error) {
    error_log('[seo] sem banco: ' . $error->getMessage());
    echo $indexHtml;
    exit;
}

$result = seoHandleRequest((string) ($_SERVER['REQUEST_URI'] ?? '/'), $indexHtml, $loaders);

http_response_code($result['status']);
echo $result['html'];
