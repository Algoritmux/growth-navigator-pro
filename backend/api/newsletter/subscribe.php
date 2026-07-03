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

    $subscriber = [
        'name' => trim((string) ($data['name'] ?? '')),
        'email' => trim((string) ($data['email'] ?? '')),
        'source' => trim((string) ($data['source'] ?? 'newsletter')),
    ];

    if (!filter_var($subscriber['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('E-mail inválido.');
    }

    $connection = getConnection();
    $statement = $connection->prepare(
        'INSERT INTO newsletter_subscribers (name, email, source, is_active)
         VALUES (:name, :email, :source, 1)
         ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            source = VALUES(source),
            is_active = 1,
            updated_at = CURRENT_TIMESTAMP'
    );
    $statement->execute([
        'name' => $subscriber['name'] !== '' ? $subscriber['name'] : null,
        'email' => $subscriber['email'],
        'source' => $subscriber['source'] !== '' ? $subscriber['source'] : 'newsletter',
    ]);

    $emailSent = false;
    $emailError = null;

    try {
        $emailSent = (new MailerService())->sendNewsletterNotification($subscriber);
    } catch (Throwable $error) {
        $emailError = $error->getMessage();
    }

    sendJson([
        'success' => true,
        'message' => 'Inscrição salva com sucesso.',
        'email_sent' => $emailSent,
        'email_error' => $emailError,
    ]);
} catch (Throwable $error) {
    sendError('Erro ao salvar inscrição.', 500, [
        'error' => $error->getMessage(),
    ]);
}
