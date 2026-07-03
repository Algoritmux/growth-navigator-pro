<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';

applyCors();

try {
    $connection = getConnection();
    $statement = $connection->query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC, id DESC');

    sendJson([
        'success' => true,
        'subscribers' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    sendError('Erro ao listar inscrições.', 500, [
        'error' => $error->getMessage(),
    ]);
}
