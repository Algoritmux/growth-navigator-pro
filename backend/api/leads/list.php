<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/auth.php';

applyCors();
requireAdmin();

try {
    $connection = getConnection();
    $statement = $connection->query('SELECT * FROM leads ORDER BY created_at DESC, id DESC');

    sendJson([
        'success' => true,
        'leads' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    sendError('Erro ao listar leads.', 500, [
        'error' => $error->getMessage(),
    ]);
}
