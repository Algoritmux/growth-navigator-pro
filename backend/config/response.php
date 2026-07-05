<?php

declare(strict_types=1);

function sendJson(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendError(string $message, int $statusCode = 400, array $extra = []): void
{
    if (!isDevelopmentEnvironment()) {
        unset($extra['error'], $extra['trace'], $extra['exception']);
    }

    sendJson(array_merge([
        'success' => false,
        'message' => $message,
    ], $extra), $statusCode);
}

function isDevelopmentEnvironment(): bool
{
    $environment = strtolower((string) (getenv('APP_ENV') ?: getenv('PHP_ENV') ?: 'production'));

    return in_array($environment, ['dev', 'development', 'local'], true);
}

function technicalErrorExtra(Throwable $error): array
{
    if (!isDevelopmentEnvironment()) {
        return [];
    }

    return [
        'error' => $error->getMessage(),
    ];
}

function sendServerError(string $message, Throwable $error, int $statusCode = 500): void
{
    sendError($message, $statusCode, technicalErrorExtra($error));
}
