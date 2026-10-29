import { getAdminAuthHeaders } from "./authSession";
import { buildLeadSource, currentPath, getAttribution, leadEventParams, trackEvent } from "./analytics";

export type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  service?: string;
  source?: string;
};

export type NewsletterPayload = {
  name?: string;
  email: string;
  source?: string;
};

export type LeadStatus = "novo" | "contatado" | "convertido" | "descartado";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  service?: string | null;
  source: string;
  status: LeadStatus;
  crm_synced: number;
  created_at: string;
  updated_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  name?: string | null;
  email: string;
  source: string;
  is_active: number;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && ["8080", "5173"].includes(window.location.port)
    ? "http://localhost/growth-navigator-pro/backend/api"
    : "/backend/api");

async function readApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Erro na API.");
  }

  return data as T;
}

function withPageSource(source: string | undefined, fallback: string) {
  const base = source?.trim() || fallback;
  return {
    base,
    source: buildLeadSource(base, currentPath(), getAttribution()),
  };
}

export async function createLead(payload: LeadPayload) {
  const { base, source } = withPageSource(payload.source, "site");
  const response = await fetch(`${API_BASE_URL}/leads/create.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...payload, source }),
  });

  const result = await readApiResponse(response);
  trackEvent("generate_lead", {
    ...leadEventParams(base),
    form_id: base,
    service: payload.service,
  });

  return result;
}

export async function subscribeToNewsletter(payload: NewsletterPayload) {
  const { base, source } = withPageSource(payload.source, "newsletter");
  const response = await fetch(`${API_BASE_URL}/newsletter/subscribe.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...payload, source }),
  });

  const result = await readApiResponse<{ is_new?: boolean }>(response);
  // Reinscrição de e-mail já cadastrado não conta como conversão nova.
  // Sem o campo (backend antigo), considera nova.
  if (result.is_new !== false) {
    trackEvent("sign_up", {
      ...leadEventParams(base),
      method: "newsletter",
      form_id: base,
    });
  }

  return result;
}

export async function fetchLeads(): Promise<Lead[]> {
  const response = await fetch(`${API_BASE_URL}/leads/list.php`, {
    headers: getAdminAuthHeaders(),
  });
  const data = await readApiResponse<{ leads: Lead[] }>(response);

  return data.leads;
}

export async function fetchNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const response = await fetch(`${API_BASE_URL}/newsletter/list.php`, {
    headers: getAdminAuthHeaders(),
  });
  const data = await readApiResponse<{ subscribers: NewsletterSubscriber[] }>(response);

  return data.subscribers;
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const response = await fetch(`${API_BASE_URL}/leads/update-status.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify({ id, status }),
  });

  return readApiResponse(response);
}
