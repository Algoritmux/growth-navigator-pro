<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/request.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../services/ListmonkService.php';

applyCors();
requirePost();

function campaignEscape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function buildNewsletterHtml(array $posts): string
{
    $html = '<h2>Insights recentes sobre crescimento previsível</h2>';
    $html .= '<p>Olá!</p>';
    $html .= '<p>Confira os conteúdos mais recentes publicados no blog:</p>';

    foreach ($posts as $post) {
        $title = campaignEscape((string) $post['title']);
        $excerpt = campaignEscape((string) $post['excerpt']);
        $url = campaignEscape((string) $post['url']);
        $category = campaignEscape((string) $post['category']);

        $html .= '<hr>';
        $html .= "<p><strong>{$title}</strong></p>";

        if ($category !== '') {
            $html .= "<p><em>{$category}</em></p>";
        }

        if ($excerpt !== '') {
            $html .= "<p>{$excerpt}</p>";
        }

        $html .= "<p><a href=\"{$url}\">Ler artigo completo →</a></p>";
    }

    $html .= '<hr>';
    $html .= '<p>Até a próxima,<br>Growth Navigator Pro</p>';

    return $html;
}

function normalizeListmonkCampaignResponse(array $response): array
{
    if (isset($response['data']) && is_array($response['data'])) {
        return $response['data'];
    }

    return $response;
}

try {
    requireAdmin();

    $data = getJsonInput();

    $limit = isset($data['limit']) ? (int) $data['limit'] : 5;
    $limit = max(1, min($limit, 10));

    $subject = trim((string) ($data['subject'] ?? 'Novos insights do blog - Growth Navigator'));
    $campaignName = trim((string) ($data['name'] ?? ''));

    if ($campaignName === '') {
        $campaignName = 'Newsletter RSS - ' . date('Y-m-d H:i');
    }

    if ($subject === '') {
        sendError('Assunto da campanha não informado.');
    }

    $siteUrl = 'https://guilhermecorreia.com.br';

    $connection = getConnection();

    $statement = $connection->prepare(
        "SELECT
            id,
            slug,
            title,
            excerpt,
            category,
            published_at,
            created_at
         FROM blog_posts
         WHERE is_published = 1
         ORDER BY COALESCE(published_at, created_at) DESC, id DESC
         LIMIT :limit"
    );

    $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
    $statement->execute();

    $posts = $statement->fetchAll();

    if (!$posts) {
        sendError('Nenhum post publicado encontrado para gerar a campanha.', 404);
    }

    $posts = array_map(function (array $post) use ($siteUrl): array {
        return [
            'id' => (int) $post['id'],
            'title' => (string) $post['title'],
            'excerpt' => (string) $post['excerpt'],
            'category' => (string) $post['category'],
            'url' => $siteUrl . '/blog/' . rawurlencode((string) $post['slug']),
        ];
    }, $posts);

    $listmonkConfig = require __DIR__ . '/../../config/listmonk.php';

    $listId = (int) ($listmonkConfig['newsletter_list_id'] ?? 0);

    if ($listId <= 0) {
        sendError('Lista da newsletter não configurada.', 500);
    }

    $html = buildNewsletterHtml($posts);

    $campaignPayload = [
        'name' => $campaignName,
        'subject' => $subject,
        'lists' => [$listId],
        'from_email' => 'Growth Navigator Pro <newsletter@guilhermecorreia.com.br>',
        'type' => 'regular',
        'content_type' => 'richtext',
        'body' => $html,
    ];

    $listmonk = new ListmonkService();
    $response = $listmonk->createCampaignDraft($campaignPayload);
    $campaign = normalizeListmonkCampaignResponse($response);

    sendJson([
        'success' => true,
        'message' => 'Campanha em rascunho criada com sucesso no Listmonk.',
        'campaign' => $campaign,
        'posts' => $posts,
    ]);
} catch (Throwable $error) {
    sendError('Erro ao criar campanha RSS no Listmonk.', 500, [
        'error' => $error->getMessage(),
    ]);
}