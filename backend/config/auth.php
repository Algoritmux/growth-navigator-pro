<?php

declare(strict_types=1);

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/response.php';

function getBearerToken(): string
{
    $authorization = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if ($authorization === '' && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (!preg_match('/^Bearer\s+(.+)$/i', trim((string) $authorization), $matches)) {
        return '';
    }

    return trim($matches[1]);
}

function getAllowedGoogleClientIds(): array
{
    $values = [
        getenv('GOOGLE_CLIENT_ID') ?: '',
        getenv('VITE_GOOGLE_CLIENT_ID') ?: '',
        getenv('GOOGLE_CLIENT_IDS') ?: '',
    ];

    $clientIds = [];
    foreach ($values as $value) {
        foreach (explode(',', $value) as $clientId) {
            $clientId = trim($clientId);
            if ($clientId !== '') {
                $clientIds[] = $clientId;
            }
        }
    }

    if ($clientIds === []) {
        $clientIds[] = '934848081124-584769e5ibh5jgrjptmaka4tpa9uvq1k.apps.googleusercontent.com';
    }

    return array_values(array_unique($clientIds));
}

function verifyGoogleIdToken(string $token): array
{
    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($token);
    $context = stream_context_create([
        'http' => [
            'ignore_errors' => true,
            'timeout' => 5,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response === false && function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 5,
            CURLOPT_FOLLOWLOCATION => false,
        ]);
        $curlResponse = curl_exec($curl);
        curl_close($curl);

        if (is_string($curlResponse)) {
            $response = $curlResponse;
        }
    }

    if ($response === false) {
        sendError('Nao foi possivel validar a sessao administrativa.', 401);
    }

    $payload = json_decode($response, true);
    if (!is_array($payload)) {
        sendError('Sessao administrativa invalida.', 401);
    }

    $allowedClientIds = getAllowedGoogleClientIds();
    $audience = (string) ($payload['aud'] ?? '');
    if (!in_array($audience, $allowedClientIds, true)) {
        sendError('Sessao administrativa invalida.', 401);
    }

    $expiresAt = isset($payload['exp']) ? (int) $payload['exp'] : 0;
    if ($expiresAt <= time()) {
        sendError('Sessao administrativa expirada.', 401);
    }

    if (($payload['email_verified'] ?? '') !== 'true' && ($payload['email_verified'] ?? false) !== true) {
        sendError('E-mail administrativo nao verificado.', 401);
    }

    $email = strtolower(trim((string) ($payload['email'] ?? '')));
    if ($email === '') {
        sendError('Sessao administrativa invalida.', 401);
    }

    $payload['email'] = $email;

    return $payload;
}

function requireAdmin(): array
{
    $token = getBearerToken();
    if ($token === '') {
        sendError('Autenticacao administrativa obrigatoria.', 401);
    }

    $payload = verifyGoogleIdToken($token);

    try {
        $connection = getConnection();
        $statement = $connection->prepare(
            'SELECT id, google_email, name, picture_url
             FROM admins
             WHERE LOWER(google_email) = LOWER(:email) AND is_active = 1
             LIMIT 1'
        );
        $statement->execute(['email' => $payload['email']]);
        $admin = $statement->fetch();

        if (!$admin) {
            sendError('Acesso administrativo negado.', 403);
        }

        $update = $connection->prepare('UPDATE admins SET last_login_at = NOW() WHERE id = :id');
        $update->execute(['id' => $admin['id']]);

        return [
            'id' => (int) $admin['id'],
            'email' => $admin['google_email'],
            'name' => $admin['name'] ?? $payload['name'] ?? null,
            'picture' => $admin['picture_url'] ?? $payload['picture'] ?? null,
        ];
    } catch (Throwable $error) {
        sendServerError('Erro ao validar acesso administrativo.', $error);
    }
}
