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
date_default_timezone_set('America/Sao_Paulo');

function makeSlugFromTitle(string $title): string
{
    $slug = iconv('UTF-8', 'ASCII//TRANSLIT', $title);
    $slug = strtolower($slug ?: $title);
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s-]+/', '-', trim($slug ?? ''));

    return trim($slug ?? '', '-');
}

function normalizeDate(string $value): string
{
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1) {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        if ($date && $date->format('Y-m-d') === $value) {
            return $value;
        }
    }

    return date('Y-m-d');
}

function normalizeTime(string $value): string
{
    if (preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $value) === 1) {
        return $value;
    }

    return date('H:i');
}

function makePublicationDateTime(string $date, string $time): DateTimeImmutable
{
    $publicationDateTime = DateTimeImmutable::createFromFormat(
        '!Y-m-d H:i:s',
        sprintf('%s %s:00', $date, $time),
        new DateTimeZone('America/Sao_Paulo')
    );

    if (!$publicationDateTime) {
        return new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo'));
    }

    return $publicationDateTime;
}

try {
    $data = getJsonInput();

    $id = isset($data['id']) && $data['id'] !== '' ? (int) $data['id'] : null;
    $title = trim((string) ($data['title'] ?? ''));
    $slug = trim((string) ($data['slug'] ?? ''));
    $excerpt = trim((string) ($data['excerpt'] ?? ''));
    $content = trim((string) ($data['content'] ?? ''));
    $category = trim((string) ($data['category'] ?? 'GTM'));
    $readTime = trim((string) ($data['read_time'] ?? $data['readTime'] ?? '5 min'));
    $tags = $data['tags'] ?? [];
    $status = trim((string) ($data['status'] ?? ''));
    $published = $status === 'draft' ? false : (bool) ($data['published'] ?? false);
    if ($status === 'published' || $status === 'scheduled') {
        $published = true;
    }
    $publicationDate = normalizeDate(trim((string) ($data['dateISO'] ?? $data['publishedDate'] ?? '')));
    $publicationTime = normalizeTime(trim((string) ($data['publishTime'] ?? $data['publishedTime'] ?? '')));
    $publicationDateTime = makePublicationDateTime($publicationDate, $publicationTime);
    $publishedAt = $publicationDateTime->format('Y-m-d H:i:s');
    $editorSettings = is_array($data['editorSettings'] ?? null) ? $data['editorSettings'] : [];

    if ($title === '') {
        sendError('Título é obrigatório.');
    }

    if ($content === '') {
        sendError('Conteúdo é obrigatório.');
    }

    if ($slug === '') {
        $slug = makeSlugFromTitle($title);
    }

    if ($slug === '') {
        sendError('Slug inválido.');
    }

    if ($status === 'scheduled') {
        $now = new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo'));
        if ($publicationDateTime <= $now) {
            sendError('Para agendar, escolha uma data e horario futuros em America/Sao_Paulo.');
        }
    }

    $allowedCategories = ['GTM', 'ICP', 'Oferta', 'Sales', 'Growth', 'IA'];
    if (!in_array($category, $allowedCategories, true)) {
        sendError('Categoria inválida.');
    }

    if (!is_array($tags)) {
        $tags = [];
    }

    $connection = getConnection();

    $payload = [
        'slug' => $slug,
        'title' => $title,
        'excerpt' => $excerpt,
        'content' => $content,
        'category' => $category,
        'tags_json' => json_encode(array_values($tags), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'read_time' => $readTime !== '' ? $readTime : '5 min',
        'editor_font' => $editorSettings['font'] ?? 'theme',
        'editor_font_size' => (int) ($editorSettings['fontSize'] ?? 18),
        'editor_line_height' => (float) ($editorSettings['lineHeight'] ?? 1.15),
        'paragraph_space_before' => (int) ($editorSettings['paragraphSpaceBefore'] ?? 8),
        'paragraph_space_after' => (int) ($editorSettings['paragraphSpaceAfter'] ?? 12),
        'is_published' => $published ? 1 : 0,
        'published_at' => $publishedAt,
    ];

    if ($id) {
        $sql = 'UPDATE blog_posts
            SET slug = :slug,
                title = :title,
                excerpt = :excerpt,
                content = :content,
                category = :category,
                tags_json = :tags_json,
                read_time = :read_time,
                editor_font = :editor_font,
                editor_font_size = :editor_font_size,
                editor_line_height = :editor_line_height,
                paragraph_space_before = :paragraph_space_before,
                paragraph_space_after = :paragraph_space_after,
                is_published = :is_published,
                published_at = :published_at
            WHERE id = :id';

        $payload['id'] = $id;
        $statement = $connection->prepare($sql);
        $statement->execute($payload);
        $savedId = $id;
    } else {
        $sql = 'INSERT INTO blog_posts (
                slug, title, excerpt, content, category, tags_json, read_time,
                editor_font, editor_font_size, editor_line_height,
                paragraph_space_before, paragraph_space_after, is_published, published_at
            ) VALUES (
                :slug, :title, :excerpt, :content, :category, :tags_json, :read_time,
                :editor_font, :editor_font_size, :editor_line_height,
                :paragraph_space_before, :paragraph_space_after, :is_published, :published_at
            )';

        $statement = $connection->prepare($sql);
        $statement->execute($payload);
        $savedId = (int) $connection->lastInsertId();
    }

    $now = new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo'));
    $computedStatus = !$published ? 'draft' : ($publicationDateTime > $now ? 'scheduled' : 'published');

    sendJson([
        'success' => true,
        'message' => 'Post salvo com sucesso.',
        'id' => $savedId,
        'slug' => $slug,
        'is_published' => $published ? 1 : 0,
        'published' => $published,
        'published_at' => $publishedAt,
        'dateISO' => $publicationDate,
        'publishTime' => $publicationTime,
        'status' => $computedStatus,
        'computed_status' => $computedStatus,
    ]);
} catch (PDOException $error) {
    $isDuplicate = $error->getCode() === '23000';

    sendError($isDuplicate ? 'Já existe um post com esse slug.' : 'Erro ao salvar post.', 500, [
        'error' => $error->getMessage(),
    ]);
} catch (Throwable $error) {
    sendError('Erro ao salvar post.', 500, [
        'error' => $error->getMessage(),
    ]);
}
