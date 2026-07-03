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

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  service?: string | null;
  source: string;
  status: string;
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

export async function createLead(payload: LeadPayload) {
  const response = await fetch(`${API_BASE_URL}/leads/create.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse(response);
}

export async function subscribeToNewsletter(payload: NewsletterPayload) {
  const response = await fetch(`${API_BASE_URL}/newsletter/subscribe.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse(response);
}

export async function fetchLeads(): Promise<Lead[]> {
  const response = await fetch(`${API_BASE_URL}/leads/list.php`);
  const data = await readApiResponse<{ leads: Lead[] }>(response);

  return data.leads;
}

export async function fetchNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const response = await fetch(`${API_BASE_URL}/newsletter/list.php`);
  const data = await readApiResponse<{ subscribers: NewsletterSubscriber[] }>(response);

  return data.subscribers;
}
