import { API_BASE_URL } from "./api";
import { getAdminAuthHeaders } from "./authSession";

type RssCampaignPost = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  url: string;
};

type CreateRssCampaignResponse = {
  success: true;
  message: string;
  campaign?: {
    id?: number;
    name?: string;
    subject?: string;
    status?: string;
  };
  posts?: RssCampaignPost[];
};

async function readApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Erro na API.");
  }

  return data as T;
}

export async function createRssNewsletterDraft(params?: {
  limit?: number;
  subject?: string;
  name?: string;
}) {
  const today = new Date().toLocaleDateString("pt-BR");

  const response = await fetch(`${API_BASE_URL}/newsletter/create-rss-campaign.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify({
      limit: params?.limit ?? 5,
      subject: params?.subject ?? "Novos insights do blog - Growth Navigator",
      name: params?.name ?? `Newsletter RSS - ${today}`,
    }),
  });

  return readApiResponse<CreateRssCampaignResponse>(response);
}