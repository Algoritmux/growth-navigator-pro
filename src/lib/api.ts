import { getAdminAuthHeaders } from "./authSession";

const DEFAULT_API_BASE_URL = "http://localhost/growth-navigator-pro/backend/api";

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim() || "";
  return configured || DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl().replace(/\/$/, "");

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.auth ? getAdminAuthHeaders() : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Erro ao comunicar com a API.");
  }

  return data as T;
}
