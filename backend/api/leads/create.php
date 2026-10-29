<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/request.php';
require_once __DIR__ . '/../../services/MailerService.php';

applyCors();
requirePost();

/** As colunas de marketing existem? (docs/privacy-marketing-opt-in-migration.sql) */
function leadsSupportMarketingOptIn(PDO $connection): bool
{
    try {
        $connection->query('SELECT marketing_opt_in, marketing_opt_in_at FROM leads LIMIT 0');
        return true;
    } catch (Throwable $error) {
        return false;
    }
}

try {
    $data = getJsonInput();

    $lead = [
        'name' => trim((string) ($data['name'] ?? '')),
        'email' => trim((string) ($data['email'] ?? '')),
        'phone' => trim((string) ($data['phone'] ?? '')),
        'message' => trim((string) ($data['message'] ?? '')),
        'service' => trim((string) ($data['service'] ?? '')),
        // A coluna source tem 120 caracteres; a origem agora inclui a página.
        'source' => mb_substr(trim((string) ($data['source'] ?? 'site')), 0, 120),
        // Opção de marketing: separada, opcional, desmarcada por padrão no formulário.
        'marketing_opt_in' => ($data['marketing_opt_in'] ?? false) === true,
    ];
    $now = (new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d H:i:s');

    if ($lead['name'] === '') {
        sendError('Nome é obrigatório.');
    }

    if (!filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('E-mail inválido.');
    }

    $connection = getConnection();
    $values = [
        'name' => $lead['name'],
        'email' => $lead['email'],
        'phone' => $lead['phone'] !== '' ? $lead['phone'] : null,
        'message' => $lead['message'] !== '' ? $lead['message'] : null,
        'service' => $lead['service'] !== '' ? $lead['service'] : null,
        'source' => $lead['source'] !== '' ? $lead['source'] : 'site',
    ];

    if (leadsSupportMarketingOptIn($connection)) {
        $statement = $connection->prepare(
            'INSERT INTO leads (name, email, phone, message, service, source, marketing_opt_in, marketing_opt_in_at)
             VALUES (:name, :email, :phone, :message, :service, :source, :marketing_opt_in, :marketing_opt_in_at)'
        );
        $statement->execute($values + [
            'marketing_opt_in' => $lead['marketing_opt_in'] ? 1 : 0,
            'marketing_opt_in_at' => $lead['marketing_opt_in'] ? $now : null,
        ]);
    } else {
        // Migração ainda não aplicada: o lead continua sendo salvo e a escolha
        // de marketing fica registrada na mensagem, para não se perder.
        if ($lead['marketing_opt_in']) {
            $values['message'] = trim(($values['message'] ?? '') . "\n\n[Aceita comunicações de marketing: sim, em {$now}]");
        }
        $statement = $connection->prepare(
            'INSERT INTO leads (name, email, phone, message, service, source)
             VALUES (:name, :email, :phone, :message, :service, :source)'
        );
        $statement->execute($values);
    }

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
        'email_error' => isDevelopmentEnvironment() ? $emailError : null,
    ], 201);
} catch (Throwable $error) {
    sendError('Erro ao salvar lead.', 500, [
        'error' => $error->getMessage(),
    ]);
}
