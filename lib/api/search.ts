import api from "@/lib/axios";

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

// GET /api/search — typo-tolerant smart search with filters + pagination.
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
  const { data } = await api.get<SmartSearchResponse>("/api/search", { params });
  return data;
}

// GET /api/search/suggestions?q= — autocomplete while typing.
export async function getSearchSuggestions(q: string): Promise<string[]> {
  if (!q.trim()) return [];
  const { data } = await api.get<{ query: string; suggestions: string[] }>("/api/search/suggestions", {
    params: { q },
  });
  return data.suggestions ?? [];
}

// GET /api/search/popular — popular keywords + trending categories for discovery UI.
export async function getPopularSearches(): Promise<{
  popular_keywords: string[];
  trending_categories: Record<string, unknown>[];
}> {
  const { data } = await api.get("/api/search/popular");
  return data;
}