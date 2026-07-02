<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

try {
    $connection = getConnection();
    $database = $connection->query('SELECT DATABASE() AS database_name')->fetch();

    sendJson([
        'success' => true,
        'message' => 'API conectada com sucesso.',
        'database' => $database['database_name'] ?? null,
        'timestamp' => date('c'),
    ]);
} catch (Throwable $error) {
    sendError('Falha ao conectar no banco de dados.', 500, [
        'error' => $error->getMessage(),
    ]);
}