<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';

applyCors();

try {
    $connection = getConnection();
    $publishedOnly = ($_GET['published'] ?? '') === '1';

    $sql = 'SELECT * FROM blog_posts';

    if ($publishedOnly) {
        $sql .= ' WHERE is_published = 1';
    }

    $sql .= ' ORDER BY COALESCE(published_at, created_at) DESC, id DESC';

    $statement = $connection->query($sql);
    $posts = $statement->fetchAll();

    $posts = array_map(function (array $post): array {
        $post['id'] = (int) $post['id'];
        $post['tags'] = json_decode($post['tags_json'] ?: '[]', true) ?: [];
        $post['published'] = (bool) $post['is_published'];
        unset($post['tags_json'], $post['is_published']);

        return $post;
    }, $posts);

    sendJson([
        'success' => true,
        'posts' => $posts,
    ]);
} catch (Throwable $error) {
    sendError('Erro ao listar posts.', 500, [
        'error' => $error->getMessage(),
    ]);
}
