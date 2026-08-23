import { apiGet } from "./client";

export interface SearchResultItem {
  listing_id: string;
  aircraft_name?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  variant?: string | null;
  jet_type?: string | null;
  thumbnail?: string | null;
  price?: number | null;
  currency?: string;
  verification_status?: string | null;
  is_verified?: boolean;
  featured_status?: boolean;
  seller_name?: string | null;
  short_description?: string | null;
  year_of_manufacture?: number | null;
  location_country?: string | null;
  listing_status?: string | null;
  listing_type?: string | null;
  relevance_score?: number | null;
}

export interface SmartSearchResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  query?: string | null;
  processing_time_ms: number;
  did_you_mean?: string | null;
  results: SearchResultItem[];
  suggestions: string[];
}

/** GET /search — production smart search with filters, sorting, pagination. */
export async function smartSearch(params: {
  q?: string;
  page?: number;
  page_size?: number;
  sort?: string;
  jet_type?: string;
  manufacturer?: string;
  min_price?: number;
  max_price?: number;
}): Promise<SmartSearchResponse> {
  const res = await apiGet<{ success: boolean; data: SmartSearchResponse }>(
    "/search",
    params as Record<string, string | number>,
    { auth: false }
  );
  return res.data;
}

/** GET /search/suggestions?q= — autocomplete while typing. */
export async function getSearchSuggestions(q: string): Promise<string[]> {
  if (!q.trim()) return [];
  const res = await apiGet<{ success: boolean; data: { query: string; suggestions: string[] } }>(
    "/search/suggestions",
    { q },
    { auth: false }
  );
  return res.data?.suggestions ?? [];
}

/** GET /search/popular — popular keywords + trending categories for discovery UI. */
export async function getPopularSearches(): Promise<{
  popular_keywords: string[];
  trending_categories: Record<string, unknown>[];
}> {
  return apiGet<{
    popular_keywords: string[];
    trending_categories: Record<string, unknown>[];
  }>("/search/popular", undefined, { auth: false });
}