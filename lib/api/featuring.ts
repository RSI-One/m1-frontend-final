import { apiGet, apiPost } from './client';

export type FeatureTierName =
  | 'base'
  | 'basics_bundle'
  | 'pro'
  | 'annual_unlimited';

export type FeaturingItem = {
  id: string;
  listing_id: string;
  name: string;
  owner: string;
  status: 'Requested' | 'Featured' | 'Expired';
  plan: string;
  requested_at?: string;
  approved_at?: string;
  expires_at?: string;
};

export type FeaturingListResponse = {
  count: number;
  results: FeaturingItem[];
};

export type FeaturingAnalytics = {
  total_records: number;
  pending_requests: number;
  featured_listings: number;
  avg_review_days: number;
};

export async function getFeaturingRequests(
  limit = 50,
  offset = 0
): Promise<FeaturingListResponse> {
  return apiGet(
    `/admin/featuring/requests?limit=${limit}&offset=${offset}`
  );
}

export async function getFeaturedListings(
  limit = 50,
  offset = 0
): Promise<FeaturingListResponse> {
  return apiGet(
    `/admin/featuring/featured?limit=${limit}&offset=${offset}`
  );
}

export async function getFeaturingAnalytics(): Promise<FeaturingAnalytics> {
  return apiGet('/admin/featuring/analytics');
}

export async function requestFeature(
  listingId: string,
  tier: FeatureTierName
) {
  return apiPost(`/admin/featuring/${listingId}/request`, { tier });
}

export async function approveFeature(listingId: string) {
  return apiPost(`/admin/featuring/${listingId}/approve`, {});
}

export async function expireFeature(listingId: string) {
  return apiPost(`/admin/featuring/${listingId}/expire`, {});
}