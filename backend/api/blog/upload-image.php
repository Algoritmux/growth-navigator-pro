<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/request.php';

applyCors();

require_once __DIR__ . '/../../config/auth.php';

requirePost();
requireAdmin();

const MAX_UPLOAD_BYTES = 5242880;

try {
    $file = $_FILES['image'] ?? $_FILES['file'] ?? null;

    if (!is_array($file)) {
        sendError('Nenhuma imagem enviada.');
    }

    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        sendError('Nao foi possivel receber a imagem.');
    }

    $tmpName = (string) ($file['tmp_name'] ?? '');
    if ($tmpName === '' || !is_uploaded_file($tmpName)) {
        sendError('Upload invalido.');
    }

    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0 || $size > MAX_UPLOAD_BYTES) {
        sendError('A imagem deve ter ate 5MB.');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) ($finfo->file($tmpName) ?: '');
    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    if (!array_key_exists($mime, $allowed)) {
        sendError('Envie uma imagem JPG, PNG ou WebP.');
    }

    $originalName = (string) ($file['name'] ?? 'imagem');
    $baseName = pathinfo($originalName, PATHINFO_FILENAME);
    $baseName = iconv('UTF-8', 'ASCII//TRANSLIT', $baseName) ?: $baseName;
    $baseName = strtolower($baseName);
    $baseName = preg_replace('/[^a-z0-9-]+/', '-', $baseName) ?: 'blog-image';
    $baseName = trim($baseName, '-') ?: 'blog-image';
    $baseName = substr($baseName, 0, 64);

    $extension = $allowed[$mime];
    $uploadDir = dirname(__DIR__, 3) . '/public/lovable-uploads';

    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        sendError('Nao foi possivel preparar a pasta de uploads.', 500);
    }

    if (!is_writable($uploadDir)) {
        sendError('A pasta de uploads nao esta gravavel.', 500);
    }

    do {
        $suffix = bin2hex(random_bytes(8));
        $fileName = sprintf('blog-%s-%s.%s', $baseName, $suffix, $extension);
        $targetPath = $uploadDir . '/' . $fileName;
    } while (file_exists($targetPath));

    if (!move_uploaded_file($tmpName, $targetPath)) {
        sendError('Nao foi possivel salvar a imagem.', 500);
    }

    sendJson([
        'success' => true,
        'url' => '/lovable-uploads/' . $fileName,
    ]);
} catch (Throwable $error) {
    sendServerError('Erro ao enviar imagem.', $error);
}
