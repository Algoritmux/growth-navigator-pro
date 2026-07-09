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
    $siteUrl = 'https://guilhermecorreia.com.br';
    $libraryUrl = $siteUrl . '/biblioteca';
    $featuredPost = $posts[0];
    $secondaryPosts = array_slice($posts, 1);

    $featuredTitle = campaignEscape((string) $featuredPost['title']);
    $featuredExcerpt = campaignEscape((string) $featuredPost['excerpt']);
    $featuredUrl = campaignEscape((string) $featuredPost['url']);
    $featuredCategory = campaignEscape((string) $featuredPost['category']);

    $html = '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">';
    $html .= 'Uma curadoria rápida para transformar marketing, vendas, dados e IA em crescimento previsível.';
    $html .= '</div>';
    $html .= '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background:#f6f1ff;font-family:Arial,Helvetica,sans-serif;color:#241235;">';
    $html .= '<tr><td align="center" style="padding:28px 12px;">';
    $html .= '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border-collapse:collapse;">';

    $html .= '<tr><td style="background:#2b1045;padding:28px 32px;border-bottom:4px solid #f4c542;">';
    $html .= '<p style="margin:0 0 8px 0;color:#f4c542;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Growth Navigator Pro</p>';
    $html .= '<h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.18;font-weight:800;">Growth Navigator Weekly</h1>';
    $html .= '</td></tr>';

    $html .= '<tr><td style="padding:34px 32px 22px 32px;">';
    $html .= '<h2 style="margin:0 0 14px 0;color:#2b1045;font-size:28px;line-height:1.2;font-weight:800;">Insights recentes sobre crescimento previsível</h2>';
    $html .= '<p style="margin:0;color:#594765;font-size:16px;line-height:1.7;">Uma curadoria rápida para quem quer transformar marketing, vendas, dados e IA em um sistema mais previsível de crescimento.</p>';
    $html .= '</td></tr>';

    $html .= '<tr><td style="padding:8px 32px 28px 32px;">';
    $html .= '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background:#321253;">';
    $html .= '<tr><td style="padding:28px;border:1px solid #4e286d;">';

    if ($featuredCategory !== '') {
        $html .= "<p style=\"margin:0 0 12px 0;color:#f4c542;font-size:12px;font-weight:bold;letter-spacing:.8px;text-transform:uppercase;\">{$featuredCategory}</p>";
    }

    $html .= "<h3 style=\"margin:0 0 14px 0;color:#ffffff;font-size:24px;line-height:1.25;font-weight:800;\">{$featuredTitle}</h3>";

    if ($featuredExcerpt !== '') {
        $html .= "<p style=\"margin:0 0 22px 0;color:#eadff2;font-size:16px;line-height:1.65;\">{$featuredExcerpt}</p>";
    }

    $html .= "<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr><td style=\"background:#f4c542;\"><a href=\"{$featuredUrl}\" style=\"display:inline-block;padding:13px 20px;color:#2b1045;font-size:14px;font-weight:bold;text-decoration:none;\">Ler análise completa</a></td></tr></table>";
    $html .= '</td></tr></table>';
    $html .= '</td></tr>';

    if ($secondaryPosts) {
        $html .= '<tr><td style="padding:2px 32px 10px 32px;">';
        $html .= '<h3 style="margin:0;color:#2b1045;font-size:20px;line-height:1.3;font-weight:800;">Mais insights para explorar</h3>';
        $html .= '</td></tr>';

        foreach ($secondaryPosts as $post) {
            $title = campaignEscape((string) $post['title']);
            $excerpt = campaignEscape((string) $post['excerpt']);
            $url = campaignEscape((string) $post['url']);
            $category = campaignEscape((string) $post['category']);

            $html .= '<tr><td style="padding:10px 32px;">';
            $html .= '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #eadff2;background:#fffaf0;">';
            $html .= '<tr><td style="padding:22px 24px;">';

            if ($category !== '') {
                $html .= "<p style=\"margin:0 0 9px 0;color:#7a4b00;font-size:11px;font-weight:bold;letter-spacing:.7px;text-transform:uppercase;\">{$category}</p>";
            }

            $html .= "<h4 style=\"margin:0 0 10px 0;color:#2b1045;font-size:18px;line-height:1.35;font-weight:800;\">{$title}</h4>";

            if ($excerpt !== '') {
                $html .= "<p style=\"margin:0 0 17px 0;color:#594765;font-size:14px;line-height:1.6;\">{$excerpt}</p>";
            }

            $html .= "<a href=\"{$url}\" style=\"color:#4c1d75;font-size:14px;font-weight:bold;text-decoration:none;\">Ler análise completa</a>";
            $html .= '</td></tr></table>';
            $html .= '</td></tr>';
        }
    }

    $html .= '<tr><td style="padding:24px 32px 8px 32px;">';
    $html .= '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background:#f7f0ff;border-left:4px solid #f4c542;">';
    $html .= '<tr><td style="padding:22px 24px;">';
    $html .= '<p style="margin:0 0 8px 0;color:#2b1045;font-size:13px;font-weight:bold;letter-spacing:.8px;text-transform:uppercase;">Para pensar</p>';
    $html .= '<p style="margin:0;color:#3b244f;font-size:17px;line-height:1.65;font-weight:bold;">Crescimento previsível não nasce de mais volume. Nasce de clareza, consistência e aprendizado acumulado.</p>';
    $html .= '</td></tr></table>';
    $html .= '</td></tr>';

    $html .= '<tr><td style="padding:20px 32px 34px 32px;">';
    $html .= '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background:#2b1045;">';
    $html .= '<tr><td style="padding:26px 24px;text-align:center;">';
    $html .= '<h3 style="margin:0 0 10px 0;color:#ffffff;font-size:22px;line-height:1.3;font-weight:800;">Quer aprofundar?</h3>';
    $html .= '<p style="margin:0 0 20px 0;color:#eadff2;font-size:15px;line-height:1.65;">Acesse a biblioteca do Growth Navigator Pro e veja materiais gratuitos para aplicar IA, dados e estratégia comercial.</p>';
    $html .= '<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td style="background:#f4c542;"><a href="' . campaignEscape($libraryUrl) . '" style="display:inline-block;padding:13px 20px;color:#2b1045;font-size:14px;font-weight:bold;text-decoration:none;">Ver biblioteca</a></td></tr></table>';
    $html .= '</td></tr></table>';
    $html .= '</td></tr>';

    $html .= '<tr><td style="padding:24px 32px;background:#170924;text-align:center;">';
    $html .= '<p style="margin:0 0 6px 0;color:#f4c542;font-size:14px;font-weight:bold;">Growth Navigator Pro</p>';
    $html .= '<p style="margin:0;color:#d9cce4;font-size:13px;line-height:1.55;">Insights sobre marketing, vendas, dados e crescimento previsível.</p>';
    $html .= '</td></tr>';
    $html .= '</table>';
    $html .= '</td></tr></table>';

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