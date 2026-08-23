

import { apiGet, apiPatch, apiPost, apiUpload } from "./client";


export interface AssetSearchResult {
  id: string;
  manufacturer: string;
  model: string;
  variant?: string | null;
  jet_type: string;
}

export type DocStatusEnum = "pending" | "approved" | "rejected";

export interface DocumentChecklistItem {
  document_type_id: number;
  name: string;
  category_name: string;
  is_mandatory: boolean;
  uploaded: boolean;
  status?: DocStatusEnum | null;
}

export type VerificationChoice = "verified" | "non_verified";

export interface DocumentChecklistResponse {
  verification_choice?: VerificationChoice | null;
  total_required: number;
  total_uploaded: number;
  is_complete: boolean;
  items: DocumentChecklistItem[];
}

export type FeatureTierName = "base" | "basics_bundle" | "pro" | "annual_unlimited";

export interface FeatureTierRead {
  id: string;
  name: FeatureTierName;
  display_name: string;
  price: number;
  duration_days: number;
  max_assets?: number | null;
  description?: string | null;
}

export interface FeaturePurchaseRead {
  id: string;
  tier_id: string;
  listing_id?: string | null;
  starts_at: string;
  expires_at: string;
  amount_paid: number;
}

export interface MediaUploadResponse {
  url: string;
  public_id: string;
  media_type: string;
}

export interface ListingDocumentRead {
  id: string;
  listing_id: string;
  document_type_id: number;
  file_url?: string | null;
  content_hash?: string | null;
  status: DocStatusEnum;
  uploaded_at: string;
}

export interface ListingResponse {
  id: string;
  asset_id: string;
  seller_id: string;
  organization_id?: string | null;
  listing_type: string;
  status: string;
  verification_status?: string | null;
  verification_choice?: string | null;
  variant?: string | null;
  price?: number | null;
  total_flight_hours?: number | null;
  reason_for_selling?: string | null;
  description?: string | null;
  is_verified: boolean;
  is_featured: boolean;
  view_count?: number;
  click_count?: number;
  chats_initiated?: number;
  created_at: string;
}

export interface VerificationPurchaseRead {
  id: string;
  listing_id: string;
  amount: number;
  is_paid: boolean;
  transaction_id?: string | null;
  paid_at?: string | null;
}

export interface SellerListingsResponse {
  count: number;
  results: ListingResponse[];
}

export interface ListingUpdateDetails {
  price?: number;
  total_flight_hours?: number;
  description?: string;
  reason_for_selling?: string;
}

export interface ListingDeclarations {
  agreed_sop_privacy: boolean;
  agreed_m1_representative: boolean;
  agreed_fraud_clause: boolean;
  agreed_terms_of_use: boolean;
}
export function searchManufacturers(q: string): Promise<string[]> {
  if (!q.trim()) return Promise.resolve([]);
  return apiGet<string[]>("/api/listings/assets/manufacturers", { q }, { auth: false });
}
export function searchModels(manufacturer: string, q: string): Promise<AssetSearchResult[]> {
  if (!manufacturer.trim() || !q.trim()) return Promise.resolve([]);
  return apiGet<AssetSearchResult[]>("/api/listings/assets/models", { manufacturer, q }, { auth: false });
}

export function getMyListings(params: { limit?: number; offset?: number } = {}) {
  return apiGet<SellerListingsResponse>("/api/listings", params);
}
export function getListing(listingId: string) {
  return apiGet<ListingResponse>(`/api/listings/${listingId}`);
}

export function createListing(payload: { asset_id: string; organization_id?: string; variant?: string }) {
  return apiPost<ListingResponse>("/api/listings", payload);
}

export function updateListingDetails(listingId: string, payload: ListingUpdateDetails) {
  return apiPatch<ListingResponse>(`/api/listings/${listingId}/details`, payload);
}

export function updateMarketType(listingId: string, marketType: "on_market" | "off_market") {
  return apiPatch<ListingResponse>(`/api/listings/${listingId}/market-type`, { market_type: marketType });
}


export function setVerificationChoice(listingId: string, verification_choice: VerificationChoice) {
  return apiPatch<ListingResponse | VerificationPurchaseRead>(`/api/listings/${listingId}/verification-choice`, {
    verification_choice,
  });
}

export function confirmVerificationPayment(listingId: string, transaction_id: string) {
  return apiPost<VerificationPurchaseRead>(`/api/listings/${listingId}/verification-payment`, { transaction_id });
}


export function uploadListingMedia(listingId: string, file: File, mediaType: "photo" | "video") {
  const form = new FormData();
  form.append("file", file);
  form.append("media_type", mediaType);
  return apiUpload<MediaUploadResponse>(`/api/listings/${listingId}/media`, form);
}


export function uploadListingDocument(listingId: string, documentTypeId: number, file: File) {
  const form = new FormData();
  form.append("document_type_id", String(documentTypeId));
  form.append("file", file);
  return apiUpload<ListingDocumentRead>(`/api/listings/${listingId}/documents`, form);
}

export function getDocumentChecklist(listingId: string) {
  return apiGet<DocumentChecklistResponse>(`/api/listings/${listingId}/documents/checklist`);
}

export function submitListing(listingId: string, declarations: ListingDeclarations) {
  return apiPost<ListingResponse>(`/api/listings/${listingId}/submit`, declarations);
}

export function getFeatureTiers() {
  return apiGet<FeatureTierRead[]>("/api/listings/tiers/feature", undefined, { auth: false });
}


export function purchaseFeature(listingId: string, tierName: FeatureTierName) {
  return apiPost<FeaturePurchaseRead>(`/api/listings/${listingId}/feature`, { tier_name: tierName });
}