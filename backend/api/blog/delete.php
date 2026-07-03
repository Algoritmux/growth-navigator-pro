<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/request.php';
require_once __DIR__ . '/../../config/auth.php';

applyCors();
requirePost();
requireAdmin();

try {
    $data = getJsonInput();
    $id = isset($data['id']) ? (int) $data['id'] : 0;

    if ($id <= 0) {
        sendError('ID inválido.');
    }

    $connection = getConnection();
    $statement = $connection->prepare('DELETE FROM blog_posts WHERE id = :id');
    $statement->execute(['id' => $id]);

    sendJson([
        'success' => true,
        'message' => 'Post excluído com sucesso.',
    ]);
} catch (Throwable $error) {
    sendError('Erro ao excluir post.', 500, [
        'error' => $error->getMessage(),
    ]);
}
