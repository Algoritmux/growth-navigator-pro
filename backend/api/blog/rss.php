<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';

function rssEscape(string $value): string
{
    return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
}

function rssCdata(string $value): string
{
    $value = str_replace(']]>', ']]]]><![CDATA[>', $value);
    return '<![CDATA[' . $value . ']]>';
}

function formatRssDate(?string $date): string
{
    if (!$date) {
        return gmdate(DATE_RSS);
    }

    $timestamp = strtotime($date);

    if ($timestamp === false) {
        return gmdate(DATE_RSS);
    }

    return gmdate(DATE_RSS, $timestamp);
}

function stripHtmlToSummary(string $content, int $limit = 220): string
{
    $text = trim(strip_tags($content));
    $text = preg_replace('/\s+/', ' ', $text) ?? $text;

    if (mb_strlen($text, 'UTF-8') <= $limit) {
        return $text;
    }

    return mb_substr($text, 0, $limit, 'UTF-8') . '...';
}

try {
    $siteUrl = 'https://guilhermecorreia.com.br';
    $feedUrl = $siteUrl . '/rss.xml';

    $connection = getConnection();

    $statement = $connection->query(
        "SELECT
            id,
            slug,
            title,
            excerpt,
            content,
            category,
            tags_json,
            read_time,
            published_at,
            created_at,
            updated_at
         FROM blog_posts
         WHERE is_published = 1
         ORDER BY COALESCE(published_at, created_at) DESC, id DESC
         LIMIT 20"
    );

    $posts = $statement->fetchAll();

    $lastBuildDate = $posts[0]['published_at'] ?? $posts[0]['created_at'] ?? null;

    header('Content-Type: application/rss+xml; charset=utf-8');

    echo '<?xml version="1.0" encoding="UTF-8" ?>' . PHP_EOL;
    ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><?= rssEscape('Guilherme Correia - Blog') ?></title>
    <link><?= rssEscape($siteUrl) ?></link>
    <description><?= rssEscape('Insights sobre Growth Marketing, IA, vendas e estratégia comercial.') ?></description>
    <language>pt-br</language>
    <lastBuildDate><?= rssEscape(formatRssDate($lastBuildDate)) ?></lastBuildDate>
    <atom:link href="<?= rssEscape($feedUrl) ?>" rel="self" type="application/rss+xml" />

<?php foreach ($posts as $post): ?>
<?php
    $slug = (string) ($post['slug'] ?? '');
    $title = (string) ($post['title'] ?? '');
    $excerpt = trim((string) ($post['excerpt'] ?? ''));
    $content = (string) ($post['content'] ?? '');
    $category = (string) ($post['category'] ?? 'Blog');
    $publishedAt = (string) ($post['published_at'] ?: $post['created_at'] ?? '');
    $updatedAt = (string) ($post['updated_at'] ?? '');

    $postUrl = $siteUrl . '/blog/' . rawurlencode($slug);
    $description = $excerpt !== '' ? $excerpt : stripHtmlToSummary($content);
    $guid = $postUrl;

    $tags = json_decode((string) ($post['tags_json'] ?? '[]'), true);
    if (!is_array($tags)) {
        $tags = [];
    }
?>
    <item>
      <title><?= rssCdata($title) ?></title>
      <link><?= rssEscape($postUrl) ?></link>
      <guid isPermaLink="true"><?= rssEscape($guid) ?></guid>
      <pubDate><?= rssEscape(formatRssDate($publishedAt)) ?></pubDate>
      <description><?= rssCdata($description) ?></description>
      <category><?= rssCdata($category) ?></category>
<?php foreach ($tags as $tag): ?>
<?php if (is_string($tag) && trim($tag) !== ''): ?>
      <category><?= rssCdata(trim($tag)) ?></category>
<?php endif; ?>
<?php endforeach; ?>
    </item>

<?php endforeach; ?>
  </channel>
</rss>
<?php
} catch (Throwable $error) {
    http_response_code(500);
    header('Content-Type: application/xml; charset=utf-8');

    echo '<?xml version="1.0" encoding="UTF-8" ?>' . PHP_EOL;
    echo '<rss version="2.0"><channel><title>Erro ao gerar RSS</title></channel></rss>';
}