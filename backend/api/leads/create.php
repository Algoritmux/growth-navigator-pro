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
    $phone = trim((string)($data['phone'] ?? ''));
    $message = trim((string)($data['message'] ?? ''));
    $service = trim((string)($data['service'] ?? ''));
    $source = trim((string)($data['source'] ?? 'site'));

    if ($name === '') {
        sendError('Informe o nome.', 422);
    }

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Informe um e-mail válido.', 422);
    }

    if ($source === '') {
        $source = 'site';
    }

    $connection = getConnection();
    $statement = $connection->prepare(
        'INSERT INTO leads (name, email, phone, message, service, source)
         VALUES (:name, :email, :phone, :message, :service, :source)'
    );

    $statement->execute([
        ':name' => $name,
        ':email' => mb_strtolower($email),
        ':phone' => $phone !== '' ? $phone : null,
        ':message' => $message !== '' ? $message : null,
        ':service' => $service !== '' ? $service : null,
        ':source' => $source,
    ]);

    sendJson([
        'success' => true,
        'message' => 'Lead salvo com sucesso.',
        'id' => (int)$connection->lastInsertId(),
    ], 201);
} catch (Throwable $error) {
    sendError('Erro ao salvar lead.', 500, [
        'error' => $error->getMessage(),
    ]);
}
