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

function isBlockStart(line: string) {
  return /^#{1,3}\s+/.test(line) || /^>\s?/.test(line) || /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line);
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
  if (looksLikeHtml(trimmed)) return sanitizeHtml(trimmed);
  return markdownToHtml(trimmed);
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
