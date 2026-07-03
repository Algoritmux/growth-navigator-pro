<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/auth.php';

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
    $connection = getConnection();
    $publishedOnly = ($_GET['published'] ?? '') === '1';

    if (!$publishedOnly) {
        requireAdmin();
    }

    $sql = 'SELECT * FROM materials';

    if ($publishedOnly) {
        $sql .= ' WHERE is_published = 1';
    }

    $sql .= ' ORDER BY created_at DESC, id DESC';

    $statement = $connection->query($sql);
    $materials = array_map('mapMaterial', $statement->fetchAll());

    sendJson([
        'success' => true,
        'materials' => $materials,
    ]);
} catch (Throwable $error) {
    sendError('Erro ao listar materiais.', 500, [
        'error' => $error->getMessage(),
    ]);
}
