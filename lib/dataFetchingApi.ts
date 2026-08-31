const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.m1marketplace.com"; // to be replaced with orignal

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("m1_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // not JSON, fall back to statusText
    }
    throw new Error(`(${res.status}) ${message}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ---- Market Research (Asset Intelligence AI scan) ----
export type AssetIntelligenceItem = {
  manufacturer: string;
  model: string;
  summary: string;
  source_url?: string;
  expected_date?: string;
  entered_service?: string;
};

export type AssetIntelligenceResult = {
  source: string;
  new_assets: AssetIntelligenceItem[];
  upcoming_assets: AssetIntelligenceItem[];
  recently_launched_assets: AssetIntelligenceItem[];
};

// Runs the scan synchronously and returns the result directly.
// Note: this can take 30-60s since it calls Claude with web search.
export function fetchAssetIntelligence() {
  return request<AssetIntelligenceResult>("/admin/data-fetching/asset-intelligence");
}
// ---- Market News ----
export type MarketNewsItem = {
  id: string;
  heading: string;
  body_text: string;
  image_url: string | null;
  link: string | null;
  created_at: string;
};

export type NewMarketNewsInput = {
  heading: string;
  body_text: string;
  image_url?: string;
  link?: string;
};

export function fetchMarketNews() {
  return request<{ count: number; results: MarketNewsItem[] }>("/admin/data-fetching/market-news");
}

export function publishMarketNews(input: NewMarketNewsInput) {
  return request<MarketNewsItem>("/admin/data-fetching/market-news", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteMarketNews(id: string) {
  return request(`/admin/data-fetching/market-news/${id}`, {
    method: "DELETE",
  });
}