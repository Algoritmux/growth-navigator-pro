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
    $status = trim((string) ($data['status'] ?? ''));
    $allowedStatuses = ['novo', 'contatado', 'convertido', 'descartado'];

    if ($id <= 0) {
        sendError('Lead inválido.');
    }

    if (!in_array($status, $allowedStatuses, true)) {
        sendError('Status inválido.');
    }

    $connection = getConnection();
    $statement = $connection->prepare(
        'UPDATE leads SET status = :status WHERE id = :id'
    );
    $statement->execute([
        'id' => $id,
        'status' => $status,
    ]);

    if ($statement->rowCount() === 0) {
        sendError('Lead não encontrado.', 404);
    }

    sendJson([
        'success' => true,
        'message' => 'Status atualizado com sucesso.',
        'id' => $id,
        'status' => $status,
    ]);
} catch (Throwable $error) {
    sendError('Erro ao atualizar status do lead.', 500, [
        'error' => $error->getMessage(),
    ]);
}
