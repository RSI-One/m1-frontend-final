import { apiPost } from "./client";

export interface NewsletterSubscribeResponse {
  message: string;
  email: string;
  is_active: boolean;
}

export async function subscribeToNewsletter(
  email: string,
  source: string = "footer"
): Promise<NewsletterSubscribeResponse> {
  return apiPost<NewsletterSubscribeResponse>("/api/newsletter/subscribe", {
    email,
    source,
  });
}