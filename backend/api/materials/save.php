<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/request.php';
require_once __DIR__ . '/../../config/auth.php';

applyCors();
requirePost();
requireAdmin();

function makeSlugFromTitle(string $title): string
{
    $slug = iconv('UTF-8', 'ASCII//TRANSLIT', $title);
    $slug = strtolower($slug ?: $title);
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s-]+/', '-', trim($slug ?? ''));

    return trim($slug ?? '', '-');
}

try {
    $data = getJsonInput();

    $id = isset($data['id']) && $data['id'] !== '' ? (int) $data['id'] : null;
    $type = trim((string) ($data['type'] ?? 'Livro'));
    $title = trim((string) ($data['title'] ?? ''));
    $description = trim((string) ($data['desc'] ?? $data['description'] ?? ''));
    $slug = trim((string) ($data['slug'] ?? ''));
    $coverImage = trim((string) ($data['coverImage'] ?? $data['cover_image'] ?? ''));
    $href = trim((string) ($data['href'] ?? ''));
    $ctaLabel = trim((string) ($data['ctaLabel'] ?? $data['cta_label'] ?? 'Acessar material'));
    $access = trim((string) ($data['access'] ?? $data['access_type'] ?? 'free'));
    $hasDownload = (bool) ($data['hasDownload'] ?? $data['has_download'] ?? false);
    $downloadUrl = trim((string) ($data['downloadUrl'] ?? $data['download_url'] ?? ''));
    $downloadButtonLabel = trim((string) ($data['downloadButtonLabel'] ?? $data['download_button_label'] ?? 'Download'));
    $tags = $data['tags'] ?? [];
    $published = (bool) ($data['published'] ?? true);

    if ($title === '') {
        sendError('Título é obrigatório.');
    }

    if ($description === '') {
        sendError('Descrição é obrigatória.');
    }

    if ($slug === '') {
        $slug = makeSlugFromTitle($title);
    }

    if ($slug === '') {
        sendError('Slug inválido.');
    }

    $allowedTypes = ['Livro', 'E-book', 'Framework', 'Guia Estratégico', 'Pesquisa', 'Apresentação', 'Estudo Exclusivo'];
    if (!in_array($type, $allowedTypes, true)) {
        sendError('Tipo inválido.');
    }

    if (!is_array($tags)) {
        $tags = [];
    }

    if (!in_array($access, ['free', 'paid'], true)) {
        sendError('Tipo de acesso invalido.');
    }

    if ($access === 'paid') {
        $hasDownload = false;
        $downloadUrl = '';
    }

    $connection = getConnection();

    $payload = [
        'type' => $type,
        'slug' => $slug,
        'title' => $title,
        'description' => $description,
        'tags_json' => json_encode(array_values($tags), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'cover_image' => $coverImage !== '' ? $coverImage : null,
        'href' => $href !== '' ? $href : null,
        'cta_label' => $ctaLabel !== '' ? $ctaLabel : 'Acessar material',
        'access_type' => $access,
        'has_download' => $hasDownload && $downloadUrl !== '' ? 1 : 0,
        'download_url' => $hasDownload && $downloadUrl !== '' ? $downloadUrl : null,
        'download_button_label' => $downloadButtonLabel !== '' ? $downloadButtonLabel : 'Download',
        'is_published' => $published ? 1 : 0,
    ];

    if ($id) {
        $sql = 'UPDATE materials
            SET type = :type,
                slug = :slug,
                title = :title,
                description = :description,
                tags_json = :tags_json,
                cover_image = :cover_image,
                href = :href,
                cta_label = :cta_label,
                access_type = :access_type,
                has_download = :has_download,
                download_url = :download_url,
                download_button_label = :download_button_label,
                is_published = :is_published
            WHERE id = :id';

        $payload['id'] = $id;
        $statement = $connection->prepare($sql);
        $statement->execute($payload);
        $savedId = $id;
    } else {
        $sql = 'INSERT INTO materials (
                type, slug, title, description, tags_json, cover_image, href, cta_label, access_type, has_download, download_url, download_button_label, is_published
            ) VALUES (
                :type, :slug, :title, :description, :tags_json, :cover_image, :href, :cta_label, :access_type, :has_download, :download_url, :download_button_label, :is_published
            )';

        $statement = $connection->prepare($sql);
        $statement->execute($payload);
        $savedId = (int) $connection->lastInsertId();
    }

    sendJson([
        'success' => true,
        'message' => 'Material salvo com sucesso.',
        'id' => $savedId,
        'slug' => $slug,
    ]);
} catch (PDOException $error) {
    $isDuplicate = $error->getCode() === '23000';

    sendError($isDuplicate ? 'Já existe um material com esse slug.' : 'Erro ao salvar material.', 500, [
        'error' => $error->getMessage(),
    ]);
} catch (Throwable $error) {
    sendError('Erro ao salvar material.', 500, [
        'error' => $error->getMessage(),
    ]);
}
