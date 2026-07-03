<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/auth.php';

applyCors();

try {
    $slug = trim($_GET['slug'] ?? '');

    if ($slug === '') {
        sendError('Slug não informado.');
    }

    $connection = getConnection();
    $statement = $connection->prepare('SELECT * FROM blog_posts WHERE slug = :slug LIMIT 1');
    $statement->execute(['slug' => $slug]);
    $post = $statement->fetch();

    if (!$post) {
        sendError('Post não encontrado.', 404);
    }

    if ((int) ($post['is_published'] ?? 0) !== 1) {
        requireAdmin();
    }

    $post['id'] = (int) $post['id'];
    $post['tags'] = json_decode($post['tags_json'] ?: '[]', true) ?: [];
    $post['published'] = (bool) $post['is_published'];
    unset($post['tags_json'], $post['is_published']);

    sendJson([
        'success' => true,
        'post' => $post,
    ]);
} catch (Throwable $error) {
    sendError('Erro ao buscar post.', 500, [
        'error' => $error->getMessage(),
    ]);
}
