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
    sendJson(array_merge([
        'success' => false,
        'message' => $message,
    ], $extra), $statusCode);
}