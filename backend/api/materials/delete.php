<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/request.php';

applyCors();
requirePost();

try {
    $data = getJsonInput();
    $id = isset($data['id']) ? (int) $data['id'] : 0;

    if ($id <= 0) {
        sendError('ID inválido.');
    }

    $connection = getConnection();
    $statement = $connection->prepare('DELETE FROM materials WHERE id = :id');
    $statement->execute(['id' => $id]);

    sendJson([
        'success' => true,
        'message' => 'Material excluído com sucesso.',
    ]);
} catch (Throwable $error) {
    sendError('Erro ao excluir material.', 500, [
        'error' => $error->getMessage(),
    ]);
}
