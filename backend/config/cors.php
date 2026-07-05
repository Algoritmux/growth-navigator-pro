<?php

declare(strict_types=1);

function applyCors(): void
{
    $allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:5173',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:5173',
    ];

    $configuredOrigins = getenv('CORS_ALLOWED_ORIGINS') ?: '';
    foreach (explode(',', $configuredOrigins) as $configuredOrigin) {
        $configuredOrigin = trim($configuredOrigin);
        if ($configuredOrigin !== '') {
            $allowedOrigins[] = $configuredOrigin;
        }
    }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function handleCors(): void
{
    applyCors();
}
