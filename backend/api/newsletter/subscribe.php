<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/request.php';
require_once __DIR__ . '/../../config/response.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Método não permitido.', 405);
}

try {
    $data = getJsonInput();

    $name = trim((string)($data['name'] ?? ''));
    $email = trim((string)($data['email'] ?? ''));
    $source = trim((string)($data['source'] ?? 'newsletter'));

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Informe um e-mail válido.', 422);
    }

    if ($source === '') {
        $source = 'newsletter';
    }

    $connection = getConnection();
    $statement = $connection->prepare(
        'INSERT INTO newsletter_subscribers (name, email, source, is_active)
         VALUES (:name, :email, :source, 1)
         ON DUPLICATE KEY UPDATE
           name = COALESCE(NULLIF(VALUES(name), \'\'), name),
           source = VALUES(source),
           is_active = 1,
           updated_at = CURRENT_TIMESTAMP'
    );

    $statement->execute([
        ':name' => $name !== '' ? $name : null,
        ':email' => mb_strtolower($email),
        ':source' => $source,
    ]);

    sendJson([
        'success' => true,
        'message' => 'Inscrição salva com sucesso.',
    ], 201);
} catch (Throwable $error) {
    sendError('Erro ao salvar inscrição.', 500, [
        'error' => $error->getMessage(),
    ]);
}
