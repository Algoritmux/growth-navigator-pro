import { API_BASE_URL } from "./api";

function getPublicOrigin(apiBaseUrl: string) {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    if (typeof window !== "undefined" && window.location.origin) {
      return window.location.origin;
    }
    return "";
  }
}

export function resolveBlogMediaUrl(src: string, apiBaseUrl = API_BASE_URL) {
  const trimmed = src.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|data:)/i.test(trimmed)) return trimmed;

  if (trimmed.startsWith("/")) {
    const origin = getPublicOrigin(apiBaseUrl);
    return origin ? `${origin}${trimmed}` : trimmed;
  }

  return trimmed;
}
