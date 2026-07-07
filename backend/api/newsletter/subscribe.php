<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/request.php';
require_once __DIR__ . '/../../services/MailerService.php';

applyCors();
requirePost();

function syncSubscriberToListmonk(array $subscriber): array
{
    $configPath = __DIR__ . '/../../config/listmonk.php';

    if (!file_exists($configPath)) {
        return [
            'success' => false,
            'error' => 'Configuração do Listmonk não encontrada.',
        ];
    }

    $config = require $configPath;

    if (!is_array($config) || empty($config['enabled'])) {
        return [
            'success' => false,
            'error' => 'Integração com Listmonk desativada.',
        ];
    }

    $baseUrl = rtrim((string) ($config['base_url'] ?? ''), '/');
    $username = (string) ($config['username'] ?? '');
    $password = (string) ($config['password'] ?? '');
    $listId = (int) ($config['newsletter_list_id'] ?? 0);

    if ($baseUrl === '' || $username === '' || $password === '' || $listId <= 0) {
        return [
            'success' => false,
            'error' => 'Configuração do Listmonk incompleta.',
        ];
    }

    $payload = [
        'email' => $subscriber['email'],
        'name' => $subscriber['name'] !== '' ? $subscriber['name'] : $subscriber['email'],
        'status' => 'enabled',
        'lists' => [$listId],
        'attribs' => [
            'source' => $subscriber['source'] !== '' ? $subscriber['source'] : 'newsletter',
        ],
        'preconfirm_subscriptions' => true,
    ];

    $url = $baseUrl . '/api/subscribers';

    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Basic ' . base64_encode($username . ':' . $password),
    ];

    $body = json_encode($payload, JSON_UNESCAPED_UNICODE);

    if ($body === false) {
        return [
            'success' => false,
            'error' => 'Erro ao preparar payload do Listmonk.',
        ];
    }

    $responseBody = false;
    $statusCode = 0;

    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_TIMEOUT => 10,
        ]);

        $responseBody = curl_exec($curl);
        $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);

        if ($responseBody === false) {
            $error = curl_error($curl);
            curl_close($curl);

            return [
                'success' => false,
                'error' => $error !== '' ? $error : 'Erro desconhecido ao chamar Listmonk.',
            ];
        }

        curl_close($curl);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'content' => $body,
                'ignore_errors' => true,
                'timeout' => 10,
            ],
        ]);

        $responseBody = @file_get_contents($url, false, $context);

        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $headerLine) {
                if (preg_match('/^HTTP\/\S+\s+(\d+)/', $headerLine, $matches)) {
                    $statusCode = (int) $matches[1];
                    break;
                }
            }
        }

        if ($responseBody === false) {
            return [
                'success' => false,
                'error' => 'Erro ao chamar Listmonk via file_get_contents.',
            ];
        }
    }

    $decoded = json_decode((string) $responseBody, true);

    if ($statusCode >= 200 && $statusCode < 300) {
        return [
            'success' => true,
            'status_code' => $statusCode,
            'response' => $decoded,
        ];
    }

    return [
        'success' => false,
        'status_code' => $statusCode,
        'error' => is_array($decoded)
            ? json_encode($decoded, JSON_UNESCAPED_UNICODE)
            : (string) $responseBody,
    ];
}

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

    $listmonkSync = syncSubscriberToListmonk($subscriber);

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
        'email_error' => isDevelopmentEnvironment() ? $emailError : null,
        'listmonk_synced' => $listmonkSync['success'] ?? false,
        'listmonk_error' => isDevelopmentEnvironment() ? ($listmonkSync['error'] ?? null) : null,
    ]);
} catch (Throwable $error) {
    sendError('Erro ao salvar inscrição.', 500, [
        'error' => $error->getMessage(),
    ]);
}