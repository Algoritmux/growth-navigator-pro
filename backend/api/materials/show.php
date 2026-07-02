<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';

applyCors();

function mapMaterial(array $material): array
{
    $material['id'] = (int) $material['id'];
    $material['tags'] = json_decode($material['tags_json'] ?: '[]', true) ?: [];
    $material['published'] = (bool) $material['is_published'];
    $material['desc'] = $material['description'];
    $material['coverImage'] = $material['cover_image'];
    $material['ctaLabel'] = $material['cta_label'];

    unset(
        $material['tags_json'],
        $material['is_published'],
        $material['description'],
        $material['cover_image'],
        $material['cta_label']
    );

    return $material;
}

try {
    $slug = trim($_GET['slug'] ?? '');

    if ($slug === '') {
        sendError('Slug não informado.');
    }

    $connection = getConnection();
    $statement = $connection->prepare('SELECT * FROM materials WHERE slug = :slug LIMIT 1');
    $statement->execute(['slug' => $slug]);
    $material = $statement->fetch();

    if (!$material) {
        sendError('Material não encontrado.', 404);
    }

    sendJson([
        'success' => true,
        'material' => mapMaterial($material),
    ]);
} catch (Throwable $error) {
    sendError('Erro ao buscar material.', 500, [
        'error' => $error->getMessage(),
    ]);
}
