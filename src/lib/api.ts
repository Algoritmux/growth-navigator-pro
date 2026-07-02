const DEFAULT_API_BASE_URL = "http://localhost/growth-navigator-pro/backend/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Erro ao comunicar com a API.");
  }

  return data as T;
}
