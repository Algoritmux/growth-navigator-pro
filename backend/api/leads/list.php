<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';

handleCors();

try {
    $connection = getConnection();
    $statement = $connection->query(
        'SELECT id, name, email, phone, message, service, source, status, crm_synced, created_at, updated_at
         FROM leads
         ORDER BY created_at DESC, id DESC'
    );

    sendJson([
        'success' => true,
        'leads' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    sendError('Erro ao listar leads.', 500, [
        'error' => $error->getMessage(),
    ]);
}
