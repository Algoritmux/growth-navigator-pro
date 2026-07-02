<?php

declare(strict_types=1);

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);

    if (!is_array($data)) {
        throw new InvalidArgumentException('JSON inválido.');
    }

    return $data;
}

function requirePost(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Método não permitido.', 405);
    }
}
