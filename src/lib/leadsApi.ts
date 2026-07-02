import { apiRequest } from "./api";

export type CreateLeadInput = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  service?: string;
  source?: string;
};

export type NewsletterInput = {
  name?: string;
  email: string;
  source?: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  id?: number;
};

export async function createLead(input: CreateLeadInput): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/leads/create.php", {
    method: "POST",
    body: input,
  });
}

export async function subscribeNewsletter(input: NewsletterInput): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/newsletter/subscribe.php", {
    method: "POST",
    body: input,
  });
}
