import { apiGet, apiPatch } from './client';

export type FlagColorValue = 'blue' | 'red' | 'pink' | 'yellow' | 'green';

export type AdminListingRow = {
  id: string;
  name: string;
  category: string;
  owner: string;
  company?: string;
  ask: string;
  status: string;
  verificationStatus: 'Verified' | 'Pending' | 'Unpublished' | string;
  featuredStatus?: 'Featured' | 'Standard' | string;
  submissionDate?: string;
  verifiedDate?: string;
  flag?: FlagColorValue;
  seller_id?: string;
  docs?: { length: number };
};

export type AdminListingsListResponse = {
  count: number;
  results: AdminListingRow[];
};

export type ListingsAnalytics = {
  monthly_views: number;
  avg_clicks_per_listing: number;
  conversion_rate: number;
  unique_inquiries: number;
  top_performers: Array<{ id: string; name: string; views: number; lois: number }>;
  worst_performers: Array<{ id: string; name: string; views: number; lois: number }>;
};

export async function getActiveListings(
  search = '',
  limit = 50,
  offset = 0
): Promise<AdminListingsListResponse> {
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search) q.set('search', search);
  return apiGet(`/admin/listings/active?${q.toString()}`);
}

export async function getApprovals(
  limit = 50,
  offset = 0
): Promise<AdminListingsListResponse> {
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiGet(`/admin/listings/approvals?${q.toString()}`);
}

export async function getIncompleteListings(
  limit = 50,
  offset = 0
): Promise<AdminListingsListResponse> {
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiGet(`/admin/listings/incomplete?${q.toString()}`);
}

export async function getListingsAnalytics(): Promise<ListingsAnalytics> {
  return apiGet('/admin/listings/analytics');
}

export async function getListingDetail(
  listingId: string
): Promise<AdminListingRow & Record<string, any>> {
  return apiGet(`/admin/listings/${listingId}`);
}

export async function approveListing(listingId: string) {
  return apiPatch(`/admin/listings/${listingId}/approve`, {});
}

export async function delistListing(listingId: string, reason?: string) {
  return apiPatch(`/admin/listings/${listingId}/delist`, { reason });
}

export async function flagListing(listingId: string, color: FlagColorValue) {
  return apiPatch(`/admin/listings/${listingId}/flag`, { color });
}

export async function approveFeatureRequest(listingId: string) {
  return apiPatch(`/admin/listings/${listingId}/feature-approve`, {});
}

export async function unfeatureListing(listingId: string) {
  return apiPatch(`/admin/listings/${listingId}/unfeature`, {});
}