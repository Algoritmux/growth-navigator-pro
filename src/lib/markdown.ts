function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeUrl(url: string) {
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|\/)/i.test(trimmed)) return trimmed;
  return "#";
}

function sanitizeImageUrl(url: string) {
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return trimmed;
  if (/^data:image\/[a-zA-Z+.-]+;base64,[a-zA-Z0-9+/=\s]+$/i.test(trimmed)) return trimmed;
  return "";
}

function isExternalUrl(url: string) {
  if (!/^https?:\/\//i.test(url)) return false;

  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./i, "") !== "guilhermecorreia.com.br";
  } catch {
    return false;
  }
}

type SpecialBlockType =
  | "bloco-destaque"
  | "card-numero"
  | "material"
  | "citacao"
  | "passos"
  | "lista";

type SpecialBlockMatch = {
  type: SpecialBlockType;
  attrs: Record<string, string>;
};

const SPECIAL_BLOCK_TYPES: SpecialBlockType[] = [
  "bloco-destaque",
  "card-numero",
  "material",
  "citacao",
  "passos",
  "lista",
];

const SPECIAL_BLOCK_OPEN_RE =
  /^\[(bloco-destaque|card-numero|material|citacao|passos|lista)\b([^\]]*)\]\s*$/i;

const IMAGE_BLOCK_RE = /^\[imagem\b([^\]]*)\]\s*$/i;
const STEP_OPEN_RE = /^\[passo\b([^\]]*)\]\s*$/i;
const STEP_CLOSE_RE = /^\[\/passo\]\s*$/i;

function slugifyHeading(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/[`*_~[\]()]/g, "")
      .replace(/&[a-z0-9#]+;/gi, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "secao"
  );
}

function createHeadingIdFactory() {
  const counts = new Map<string, number>();

  return (text: string) => {
    const base = slugifyHeading(text);
    const count = counts.get(base) || 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

function looksLikeHtml(content: string) {
  const withoutQuotedValues = content.replace(/"[^"]*"|'[^']*'/g, "");
  return /<\/?[a-z][\s\S]*>/i.test(withoutQuotedValues);
}

function stripHtmlTags(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

function sanitizeHtml(html: string) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");

  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return withoutScripts
      .replace(/\son\w+=(["']).*?\1/gi, "")
      .replace(/\son\w+=([^\s>]+)/gi, "")
      .replace(/\s(href|src)=(["'])\s*javascript:[\s\S]*?\2/gi, "");
  }

  const blockedTags = new Set(["script", "style", "iframe", "object", "embed", "meta", "link"]);
  const allowedTags = new Set([
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "div",
    "em",
    "figcaption",
    "figure",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strong",
    "u",
    "ul",
  ]);
  const globalAttrs = new Set(["title"]);
  const linkAttrs = new Set(["href", "target", "rel", "title"]);
  const imageAttrs = new Set(["src", "alt", "title", "width", "height"]);

  const parser = new DOMParser();
  const doc = parser.parseFromString(withoutScripts, "text/html");
  const elements = Array.from(doc.body.querySelectorAll("*"));

  for (const el of elements) {
    const tag = el.tagName.toLowerCase();

    if (blockedTags.has(tag)) {
      el.remove();
      continue;
    }

    if (!allowedTags.has(tag)) {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
      } else {
        el.remove();
      }
      continue;
    }

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      const keepGlobal = globalAttrs.has(name);
      const keepLink = tag === "a" && linkAttrs.has(name);
      const keepImage = tag === "img" && imageAttrs.has(name);

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        continue;
      }

      if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (!keepGlobal && !keepLink && !keepImage) {
        el.removeAttribute(attr.name);
      }
    }

    if (tag === "a") {
      const href = (el.getAttribute("href") || "").trim();
      if (!href || !/^(https?:\/\/|mailto:|\/|#)/i.test(href)) {
        el.setAttribute("href", "#");
      }
      if (isExternalUrl(href)) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      } else {
        el.removeAttribute("target");
        el.removeAttribute("rel");
      }
    }

    if (tag === "img") {
      const src = sanitizeImageUrl(el.getAttribute("src") || "");
      if (!src) {
        el.remove();
        continue;
      }
      el.setAttribute("src", src);
      if (!el.getAttribute("alt")) {
        el.setAttribute("alt", "");
      }
    }
  }

  return doc.body.innerHTML.trim();
}

function parseInline(text: string) {
  let result = escapeHtml(text);

  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    const safeUrl = sanitizeImageUrl(url);
    if (!safeUrl) return "";
    const safeAlt = escapeHtml(alt || "");
    return `<img src="${safeUrl}" alt="${safeAlt}" />`;
  });
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(/_([^_]+)_/g, "<em>$1</em>");
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const safeUrl = sanitizeUrl(url);
    return `<a href="${safeUrl}"${externalUrlAttributes(safeUrl)}>${label}</a>`;
  });

  return result;
}

function parseAttributes(source: string) {
  const attrs: Record<string, string> = {};
  const attrRe = /([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"']+))/g;
  let match: RegExpExecArray | null;

  while ((match = attrRe.exec(source)) !== null) {
    const key = match[1].toLowerCase();
    attrs[key] = match[2] ?? match[3] ?? match[4] ?? "";
  }

  return attrs;
}

function parseSpecialBlockOpen(line: string): SpecialBlockMatch | null {
  const match = line.trim().match(SPECIAL_BLOCK_OPEN_RE);
  if (!match) return null;

  return {
    type: match[1].toLowerCase() as SpecialBlockType,
    attrs: parseAttributes(match[2] || ""),
  };
}

const COVER_IMAGE_META_RE =
  /^\s*<!--\s*blog-cover-image:\s*([^\n\r]*?)\s*-->\s*/i;

export function extractCoverImageSrc(content: string) {
  const source = content?.trimStart() || "";
  const match = source.match(COVER_IMAGE_META_RE);
  if (!match?.[1]) return undefined;

  const safe = sanitizeImageUrl(match[1]);
  return safe || undefined;
}

export function stripCoverImageMeta(content: string) {
  return (content || "").replace(COVER_IMAGE_META_RE, "");
}

export function withCoverImageMeta(content: string, coverImage?: string) {
  const cleanContent = stripCoverImageMeta(content).trim();
  const safeCover = sanitizeImageUrl(coverImage || "");

  if (!safeCover) return cleanContent;
  return `<!-- blog-cover-image: ${safeCover} -->\n${cleanContent}`;
}

function parseImageBlockOpen(line: string) {
  const match = line.trim().match(IMAGE_BLOCK_RE);
  if (!match) return null;
  return parseAttributes(match[1] || "");
}

function specialBlockCloseRe(type: SpecialBlockType) {
  return new RegExp(`^\\[\\/${type}\\]\\s*$`, "i");
}

function externalUrlAttributes(url: string) {
  return isExternalUrl(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
}

function normalizeSpecialBodyHtml(bodyHtml: string) {
  return bodyHtml
    .replace(/^(?:\s|<br\s*\/?>|<p>\s*(?:<br\s*\/?>)?\s*<\/p>)+/gi, "")
    .replace(/(?:\s|<br\s*\/?>|<p>\s*(?:<br\s*\/?>)?\s*<\/p>)+$/gi, "")
    .trim();
}

function renderSpecialBlock(
  type: SpecialBlockType,
  attrs: Record<string, string>,
  bodyHtml: string,
) {
  const content = normalizeSpecialBodyHtml(bodyHtml);
  if (!content) return "";

  if (type === "bloco-destaque") {
    return [
      '<aside class="not-prose blog-special-block blog-special-highlight">',
      '<div class="blog-special-highlight-marker" aria-hidden="true"></div>',
      `<div class="blog-special-body">${content}</div>`,
      "</aside>",
    ].join("");
  }

  if (type === "card-numero") {
    const number = escapeHtml(attrs.numero || attrs.numero_card || "");
    const title = escapeHtml(attrs.titulo || "");

    return [
      '<section class="not-prose blog-special-block blog-special-number-card">',
      number
        ? `<div class="blog-special-number" aria-hidden="true">${number}</div>`
        : "",
      '<div class="blog-special-number-content">',
      title ? `<h4 class="blog-special-title">${title}</h4>` : "",
      `<div class="blog-special-body">${content}</div>`,
      "</div>",
      "</section>",
    ].join("");
  }

  if (type === "material") {
    const title = escapeHtml(attrs.titulo || "Material gratuito");
    const button = escapeHtml(attrs.botao || "Acessar material");
    const href = sanitizeUrl(attrs.link || "/biblioteca");

    return [
      '<aside class="not-prose blog-special-block blog-special-material">',
      '<div class="blog-special-material-content">',
      `<h4 class="blog-special-material-title">${title}</h4>`,
      `<div class="blog-special-body">${content}</div>`,
      "</div>",
      `<a class="blog-special-material-button" href="${href}"${externalUrlAttributes(href)}>${button}</a>`,
      "</aside>",
    ].join("");
  }

  if (type === "lista") {
    return [
      '<section class="not-prose blog-special-block blog-special-list">',
      '<div class="blog-special-list-marker" aria-hidden="true">✓</div>',
      `<div class="blog-special-body">${content}</div>`,
      "</section>",
    ].join("");
  }

  if (type === "passos") {
    return content;
  }

  const author = escapeHtml(attrs.autor || "");

  return [
    '<figure class="not-prose blog-special-block blog-special-quote">',
    `<blockquote class="blog-special-body">${content}</blockquote>`,
    author ? `<figcaption>${author}</figcaption>` : "",
    "</figure>",
  ].join("");
}

function renderImageBlock(attrs: Record<string, string>) {
  const src = sanitizeImageUrl(attrs.src || "");
  if (!src) return "";

  const alt = escapeHtml(attrs.alt || attrs.descricao || "");
  const caption = escapeHtml(attrs.legenda || attrs.caption || "");

  return [
    '<figure class="not-prose blog-special-image">',
    `<img src="${src}" alt="${alt}" />`,
    caption ? `<figcaption>${caption}</figcaption>` : "",
    "</figure>",
  ].join("");
}

function renderStepsBlock(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const steps: Array<{ title: string; body: string }> = [];
  let i = 0;

  while (i < lines.length) {
    const match = lines[i].trim().match(STEP_OPEN_RE);
    if (!match) {
      i += 1;
      continue;
    }

    const attrs = parseAttributes(match[1] || "");
    const bodyLines: string[] = [];
    let j = i + 1;

    while (j < lines.length && !STEP_CLOSE_RE.test(lines[j].trim())) {
      bodyLines.push(lines[j]);
      j += 1;
    }

    if (j < lines.length) {
      steps.push({
        title: attrs.titulo || attrs.title || "",
        body: markdownToHtml(bodyLines.join("\n")),
      });
      i = j + 1;
      continue;
    }

    i += 1;
  }

  if (steps.length === 0) return "";

  return [
    '<section class="not-prose blog-special-block blog-special-steps">',
    steps
      .map((step, index) => {
        const title = escapeHtml(step.title || `Passo ${index + 1}`);
        return [
          '<article class="blog-special-step">',
          `<div class="blog-special-step-number" aria-hidden="true">${index + 1}</div>`,
          '<div class="blog-special-step-content">',
          `<h4>${title}</h4>`,
          `<div class="blog-special-body">${normalizeSpecialBodyHtml(step.body)}</div>`,
          "</div>",
          "</article>",
        ].join("");
      })
      .join(""),
    "</section>",
  ].join("");
}

function renderLooseNumberedSteps(
  steps: Array<{ number: string; bodyLines: string[] }>,
) {
  return [
    '<ol class="not-prose blog-loose-steps">',
    steps
      .map((step) => {
        const number = escapeHtml(step.number);
        const body = normalizeSpecialBodyHtml(markdownToHtml(step.bodyLines.join("\n")));
        return [
          `<li class="blog-loose-step" value="${number}">`,
          `<div class="blog-loose-step-number" aria-hidden="true">${number}</div>`,
          `<div class="blog-special-body">${body}</div>`,
          "</li>",
        ].join("");
      })
      .join(""),
    "</ol>",
  ].join("");
}

function renderSpecialBlocksInHtml(html: string) {
  let rendered = html;

  for (const type of SPECIAL_BLOCK_TYPES) {
    const blockRe = new RegExp(
      [
        String.raw`(?:<(?:p|div|section|span)[^>]*>\s*)?`,
        String.raw`\[`,
        type,
        String.raw`\b([^\]]*)\]\s*`,
        String.raw`(?:<\/(?:p|div|section|span)>\s*)?`,
        String.raw`([\s\S]*?)`,
        String.raw`(?:<(?:p|div|section|span)[^>]*>\s*)?`,
        String.raw`\[\/`,
        type,
        String.raw`\]\s*`,
        String.raw`(?:<\/(?:p|div|section|span)>\s*)?`,
      ].join(""),
      "gi",
    );

    rendered = rendered.replace(blockRe, (_match, attrSource, bodyHtml) =>
      renderSpecialBlock(type, parseAttributes(attrSource || ""), bodyHtml),
    );
  }

  return rendered;
}

function normalizeHtmlToMarkdown(html: string) {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html
      .replace(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, level, text) => {
        return `${"#".repeat(Number(level))} ${stripHtmlTags(text)}`;
      })
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, text) => {
        return `- ${stripHtmlTags(text)}`;
      })
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<hr\s*\/?>/gi, "\n\n---\n\n")
      .replace(/<\/(p|div|section|blockquote|ul|ol)>/gi, "\n\n")
      .replace(/<(p|div|section|blockquote|ul|ol)[^>]*>/gi, "")
      .replace(
        /<figure[^>]*>\s*<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>\s*<figcaption[^>]*>([\s\S]*?)<\/figcaption>\s*<\/figure>/gi,
        (_match, src, alt, caption) => {
          return sanitizeImageUrl(src)
            ? `[imagem src="${src}" alt="${stripHtmlTags(alt)}" legenda="${stripHtmlTags(caption)}"]`
            : "";
        },
      )
      .replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, (_match, src) => {
        return sanitizeImageUrl(src) ? `![](${src})` : "";
      })
      .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (
        _match,
        href,
        text,
      ) => {
        return `[${stripHtmlTags(text)}](${sanitizeUrl(href)})`;
      })
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const blockTags = new Set([
    "article",
    "aside",
    "blockquote",
    "div",
    "figure",
    "h1",
    "h2",
    "h3",
    "hr",
    "li",
    "ol",
    "p",
    "section",
    "ul",
  ]);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const lines: string[] = [];

  const pushBlank = () => {
    if (lines.length > 0 && lines[lines.length - 1] !== "") {
      lines.push("");
    }
  };

  const pushLines = (value: string) => {
    const normalized = value
      .replace(/\r\n/g, "\n")
      .replace(/\u00a0/g, " ")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of normalized) {
      lines.push(line);
    }
  };

  const serializeInline = (node: Node): string => {
    if (node.nodeType === 3) return node.textContent || "";
    if (node.nodeType !== 1) return "";

    const element = node as Element;
    const tag = element.tagName.toLowerCase();
    const inner = () => Array.from(element.childNodes).map(serializeInline).join("");

    if (tag === "br") return "\n";

    if (tag === "img") {
      const src = sanitizeImageUrl(element.getAttribute("src") || "");
      if (!src) return "";
      const alt = element.getAttribute("alt") || "";
      return `![${alt}](${src})`;
    }

    if (tag === "a") {
      const href = sanitizeUrl(element.getAttribute("href") || "");
      return `[${inner().trim()}](${href})`;
    }

    if (tag === "strong" || tag === "b") return `**${inner()}**`;
    if (tag === "em" || tag === "i") return `*${inner()}*`;
    if (tag === "code") return `\`${inner()}\``;

    return inner();
  };

  const hasBlockChildren = (element: Element) =>
    Array.from(element.children).some((child) =>
      blockTags.has(child.tagName.toLowerCase()),
    );

  const appendNode = (node: Node) => {
    if (node.nodeType === 3) {
      pushLines(node.textContent || "");
      return;
    }

    if (node.nodeType !== 1) return;

    const element = node as Element;
    const tag = element.tagName.toLowerCase();

    if (tag === "h1" || tag === "h2" || tag === "h3") {
      pushLines(`${"#".repeat(Number(tag[1]))} ${serializeInline(element)}`);
      pushBlank();
      return;
    }

    if (tag === "ul" || tag === "ol") {
      let index = 1;
      for (const child of Array.from(element.children)) {
        if (child.tagName.toLowerCase() !== "li") continue;
        const marker = tag === "ol" ? `${index}.` : "-";
        pushLines(`${marker} ${serializeInline(child)}`);
        index += 1;
      }
      pushBlank();
      return;
    }

    if (tag === "hr") {
      pushLines("---");
      pushBlank();
      return;
    }

    if (tag === "figure") {
      const image = element.querySelector("img");
      if (image) {
        const src = sanitizeImageUrl(image.getAttribute("src") || "");
        const alt = image.getAttribute("alt") || "";
        const caption =
          element.querySelector("figcaption")?.textContent?.trim() || "";
        if (src && caption) {
          pushLines(
            `[imagem src="${src}" alt="${alt.replace(/"/g, "'")}" legenda="${caption.replace(/"/g, "'")}"]`,
          );
          pushBlank();
          return;
        }
        if (src) {
          pushLines(`![${alt}](${src})`);
          pushBlank();
          return;
        }
      }
    }

    if (tag === "blockquote") {
      const quoteLines = serializeInline(element)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `> ${line}`);
      pushLines(quoteLines.join("\n"));
      pushBlank();
      return;
    }

    if (tag === "p" || tag === "div" || tag === "section" || tag === "article") {
      if (hasBlockChildren(element)) {
        Array.from(element.childNodes).forEach(appendNode);
      } else {
        pushLines(serializeInline(element));
        pushBlank();
      }
      return;
    }

    if (tag === "img") {
      pushLines(serializeInline(element));
      pushBlank();
      return;
    }

    Array.from(element.childNodes).forEach(appendNode);
  };

  Array.from(doc.body.childNodes).forEach(appendNode);

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function isBlockStart(line: string) {
  return (
    /^#{1,3}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^(-{3,}|\*{3,}|_{3,})$/.test(line.trim()) ||
    Boolean(parseSpecialBlockOpen(line)) ||
    Boolean(parseImageBlockOpen(line))
  );
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  const getHeadingId = createHeadingIdFactory();
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const specialBlock = parseSpecialBlockOpen(line);
    if (specialBlock) {
      const bodyLines: string[] = [];
      let j = i + 1;
      const closeRe = specialBlockCloseRe(specialBlock.type);

      while (j < lines.length && !closeRe.test(lines[j].trim())) {
        bodyLines.push(lines[j]);
        j += 1;
      }

      if (j < lines.length) {
        if (specialBlock.type === "passos") {
          html.push(renderStepsBlock(bodyLines.join("\n")));
          i = j + 1;
          continue;
        }

        html.push(
          renderSpecialBlock(
            specialBlock.type,
            specialBlock.attrs,
            markdownToHtml(bodyLines.join("\n")),
          ),
        );
        i = j + 1;
        continue;
      }

      if (specialBlock.type === "passos") {
        html.push(renderStepsBlock(bodyLines.join("\n")));
      } else {
        html.push(
          renderSpecialBlock(
            specialBlock.type,
            specialBlock.attrs,
            markdownToHtml(bodyLines.join("\n")),
          ),
        );
      }
      i = lines.length;
      continue;
    }

    const imageBlockAttrs = parseImageBlockOpen(line);
    if (imageBlockAttrs) {
      html.push(renderImageBlock(imageBlockAttrs));
      i += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const rawContent = headingMatch[2].trim();
      const content = parseInline(rawContent);
      html.push(
        `<h${level} id="${getHeadingId(rawContent)}">${content}</h${level}>`,
      );
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(parseInline(lines[i].trim().replace(/^>\s?/, "")));
        i += 1;
      }
      html.push(`<blockquote><p>${quoteLines.join("<br />")}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^[-*]\s+/, "")));
        i += 1;
      }
      html.push(
        `<ul class="blog-editorial-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemLines = [
          parseInline(lines[i].trim().replace(/^\d+\.\s+/, "")),
        ];
        i += 1;

        while (i < lines.length) {
          const current = lines[i].trim();
          if (!current) {
            i += 1;
            if (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
              break;
            }
            if (itemLines.length > 1) break;
            continue;
          }
          if (isBlockStart(current)) break;
          itemLines.push(parseInline(current));
          i += 1;
        }

        items.push(itemLines.join("<br />"));
      }
      html.push(
        `<ol class="blog-numbered-list">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`,
      );
      continue;
    }

    if (/^\d+[.)]?\s*$/.test(line.trim())) {
      html.push(`<p>${parseInline(line.trim())}</p>`);
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      html.push("<hr />");
      i += 1;
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (!current || isBlockStart(current)) break;
      paragraphLines.push(parseInline(current));
      i += 1;
    }

    if (paragraphLines.length > 0) {
      html.push(`<p>${paragraphLines.join("<br />")}</p>`);
    } else {
      i += 1;
    }
  }

  return html.join("");
}

export function contentToHtml(content: string) {
  const trimmed = stripCoverImageMeta(content).trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) {
    return renderSpecialBlocksInHtml(
      markdownToHtml(normalizeHtmlToMarkdown(sanitizeHtml(trimmed))),
    );
  }
  return renderSpecialBlocksInHtml(markdownToHtml(trimmed));
}

export function extractFirstImageSrc(content: string) {
  const source = stripCoverImageMeta(content).trim();
  if (!source) return undefined;

  const htmlMatch = source.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (htmlMatch?.[1]) {
    const safe = sanitizeImageUrl(htmlMatch[1]);
    if (safe) return safe;
  }

  const markdownMatch = source.match(/!\[[^\]]*]\(([^)]+)\)/i);
  if (markdownMatch?.[1]) {
    const safe = sanitizeImageUrl(markdownMatch[1]);
    if (safe) return safe;
  }

  return undefined;
}
