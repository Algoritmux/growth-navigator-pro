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

type SpecialBlockType =
  | "bloco-destaque"
  | "card-numero"
  | "material"
  | "citacao";

type SpecialBlockMatch = {
  type: SpecialBlockType;
  attrs: Record<string, string>;
};

const SPECIAL_BLOCK_TYPES: SpecialBlockType[] = [
  "bloco-destaque",
  "card-numero",
  "material",
  "citacao",
];

const SPECIAL_BLOCK_OPEN_RE =
  /^\[(bloco-destaque|card-numero|material|citacao)\b([^\]]*)\]\s*$/i;

function looksLikeHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content);
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
      el.setAttribute("rel", "noreferrer");
      if (/^https?:\/\//i.test(href)) {
        el.setAttribute("target", "_blank");
      } else {
        el.removeAttribute("target");
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
    return `<a href="${safeUrl}" target="_blank" rel="noreferrer">${label}</a>`;
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

function specialBlockCloseRe(type: SpecialBlockType) {
  return new RegExp(`^\\[\\/${type}\\]\\s*$`, "i");
}

function externalUrlAttributes(url: string) {
  return /^https?:\/\//i.test(url) ? ' target="_blank" rel="noreferrer"' : "";
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

  const author = escapeHtml(attrs.autor || "");

  return [
    '<figure class="not-prose blog-special-block blog-special-quote">',
    `<blockquote class="blog-special-body">${content}</blockquote>`,
    author ? `<figcaption>${author}</figcaption>` : "",
    "</figure>",
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

function isBlockStart(line: string) {
  return (
    /^#{1,3}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    Boolean(parseSpecialBlockOpen(line))
  );
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
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

      html.push(`<p>${parseInline(line)}</p>`);
      i += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = parseInline(headingMatch[2].trim());
      html.push(`<h${level}>${content}</h${level}>`);
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
      html.push(`<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^\d+\.\s+/, "")));
        i += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`);
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
  const trimmed = content.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) {
    return renderSpecialBlocksInHtml(sanitizeHtml(trimmed));
  }
  return renderSpecialBlocksInHtml(markdownToHtml(trimmed));
}

export function extractFirstImageSrc(content: string) {
  const source = content?.trim() || "";
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
