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

/** Helper to extract data from optional StandardResponse envelope */
function unwrapData<T>(raw: any): T {
  if (raw && typeof raw === "object") {
    if ("data" in raw && raw.data !== undefined && raw.data !== null) {
      return raw.data as T;
    }
  }
  return raw as T;
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
  try {
    const res = await apiGet<any>("/search", params as Record<string, string | number>, { auth: false });
    const payload = unwrapData<SmartSearchResponse>(res);
    return (
      payload || {
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
        query: params.q,
        processing_time_ms: 0,
        did_you_mean: null,
        results: [],
        suggestions: [],
      }
    );
  } catch (err) {
    console.error("Smart search API error:", err);
    return {
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
      query: params.q,
      processing_time_ms: 0,
      did_you_mean: null,
      results: [],
      suggestions: [],
    };
  }
}

/** GET /search/suggestions?q= — autocomplete while typing with did-you-mean support. */
export async function getSearchSuggestions(q: string): Promise<{
  suggestions: string[];
  didYouMean?: string | null;
}> {
  if (!q.trim()) return { suggestions: [] };
  try {
    const [sugRes, searchRes] = await Promise.allSettled([
      apiGet<any>("/search/suggestions", { q }, { auth: false }),
      apiGet<any>("/search", { q, page_size: 5 }, { auth: false }),
    ]);

    const suggestions: string[] = [];
    let didYouMean: string | null = null;

    if (sugRes.status === "fulfilled" && sugRes.value) {
      const rawSug = unwrapData<{ query?: string; suggestions?: string[] }>(sugRes.value);
      if (rawSug && Array.isArray(rawSug.suggestions)) {
        suggestions.push(...rawSug.suggestions);
      }
    }

    if (searchRes.status === "fulfilled" && searchRes.value) {
      const searchData = unwrapData<SmartSearchResponse>(searchRes.value);
      if (searchData) {
        if (searchData.did_you_mean) {
          didYouMean = searchData.did_you_mean;
        }
        if (Array.isArray(searchData.suggestions)) {
          for (const s of searchData.suggestions) {
            if (!suggestions.includes(s)) suggestions.push(s);
          }
        }
      }
    }

    return { suggestions, didYouMean };
  } catch (err) {
    console.error("Suggestions API error:", err);
    return { suggestions: [] };
  }
}

/** GET /search/popular — popular keywords + trending categories for discovery UI. */
export async function getPopularSearches(): Promise<{
  popular_keywords: string[];
  trending_categories: { category: string; count: number }[];
}> {
  try {
    const res = await apiGet<any>("/search/popular", undefined, { auth: false });
    const payload = unwrapData<{
      popular_keywords?: string[];
      trending_categories?: { category: string; count: number }[];
    }>(res);

    return {
      popular_keywords: payload?.popular_keywords || [],
      trending_categories: payload?.trending_categories || [],
    };
  } catch (err) {
    console.error("Popular searches API error:", err);
    return {
      popular_keywords: [],
      trending_categories: [],
    };
  }
}