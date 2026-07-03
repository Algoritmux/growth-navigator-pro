<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/request.php';
require_once __DIR__ . '/../../services/MailerService.php';

applyCors();
requirePost();

try {
    $data = getJsonInput();

    $lead = [
        'name' => trim((string) ($data['name'] ?? '')),
        'email' => trim((string) ($data['email'] ?? '')),
        'phone' => trim((string) ($data['phone'] ?? '')),
        'message' => trim((string) ($data['message'] ?? '')),
        'service' => trim((string) ($data['service'] ?? '')),
        'source' => trim((string) ($data['source'] ?? 'site')),
    ];

    if ($lead['name'] === '') {
        sendError('Nome é obrigatório.');
    }

    if (!filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('E-mail inválido.');
    }

    $connection = getConnection();
    $statement = $connection->prepare(
        'INSERT INTO leads (name, email, phone, message, service, source)
         VALUES (:name, :email, :phone, :message, :service, :source)'
    );
    $statement->execute([
        'name' => $lead['name'],
        'email' => $lead['email'],
        'phone' => $lead['phone'] !== '' ? $lead['phone'] : null,
        'message' => $lead['message'] !== '' ? $lead['message'] : null,
        'service' => $lead['service'] !== '' ? $lead['service'] : null,
        'source' => $lead['source'] !== '' ? $lead['source'] : 'site',
    ]);

    $emailSent = false;
    $emailError = null;

    try {
        $emailSent = (new MailerService())->sendLeadNotification($lead);
    } catch (Throwable $error) {
        $emailError = $error->getMessage();
    }

    sendJson([
        'success' => true,
        'message' => 'Lead salvo com sucesso.',
        'id' => (int) $connection->lastInsertId(),
        'email_sent' => $emailSent,
        'email_error' => $emailError,
    ], 201);
} catch (Throwable $error) {
    sendError('Erro ao salvar lead.', 500, [
        'error' => $error->getMessage(),
    ]);
}
