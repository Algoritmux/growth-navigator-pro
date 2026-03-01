import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURAÇÃO ---
const SITE_URL = "https://guilhermecorreia.com.br"; // DOMÍNIO OFICIAL
const RSS_PATH = path.join(__dirname, '../public/rss.xml');

// Simulando a leitura dos materiais (Idealmente leríamos do store.ts ou um JSON)
// Vou pegar o conteúdo do SEED_MATERIALS diretamente para simplificar sem quebrar imports de React
const materialsFile = fs.readFileSync(path.join(__dirname, '../src/lib/materials-store.ts'), 'utf-8');
const seedMatch = materialsFile.match(/const SEED_MATERIALS: MaterialItem\[\] = (\[[\s\S]*?\]);/);

if (!seedMatch) {
    console.error("❌ Não foi possível encontrar SEED_MATERIALS no store.");
    process.exit(1);
}

const materialsContent = seedMatch[1];
const materialBlocks = materialsContent.split(/\{[\s\S]*?id:/).slice(1);

const extractValue = (block, key) => {
    const regex = new RegExp(`${key}:\\s*["'](.*?)["']`);
    const match = block.match(regex);
    return match ? match[1] : '';
};

const materials = materialBlocks.map(block => ({
    title: extractValue(block, 'title'),
    slug: extractValue(block, 'slug'),
    desc: extractValue(block, 'desc'),
    type: extractValue(block, 'type'),
    published: block.includes('published: true')
})).filter(m => m.published);

const generateRssItem = (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${SITE_URL}/biblioteca/${item.slug || ''}</link>
      <guid>${SITE_URL}/biblioteca/${item.slug || ''}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <description><![CDATA[${item.desc}]]></description>
      <category>${item.type}</category>
    </item>`;

const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Guilherme Correia - Publicações & Materiais</title>
    <link>${SITE_URL}</link>
    <description>Growth Marketing, IA e Estratégia Comercial</description>
    <language>pt-br</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${materials.map(generateRssItem).join('')}
  </channel>
</rss>`;

fs.writeFileSync(RSS_PATH, rssFeed);
console.log("✅ RSS Feed gerado com sucesso em public/rss.xml");
