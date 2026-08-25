import { apiGet, apiPost } from "./client";
import { Jet, SfItem } from "../types";

export interface ApiListingItem {
  listing_id?: string;
  id?: string;
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
  is_featured?: boolean;
  seller_name?: string | null;
  short_description?: string | null;
  description?: string | null;
  year_of_manufacture?: number | null;
  location_country?: string | null;
  listing_status?: string | null;
  listing_type?: string | null;
  [key: string]: unknown;
}

export interface ListingCarousels {
  featured: ApiListingItem[];
  verified: ApiListingItem[];
  new: ApiListingItem[];
  general: ApiListingItem[];
}

/** GET /listings/carousels */
export async function getCarousels(): Promise<ListingCarousels> {
  const raw = await apiGet<Record<string, unknown>>("/listings/carousels", undefined, { auth: false });

  const payload =
    raw && typeof raw === "object" && "data" in raw && raw.data && typeof raw.data === "object"
      ? (raw.data as Record<string, unknown>)
      : (raw as Record<string, unknown>) ?? {};

  const pick = (...keys: string[]): ApiListingItem[] => {
    for (const key of keys) {
      const value = payload?.[key];
      if (Array.isArray(value)) return value as ApiListingItem[];
    }
    return [];
  };

  return {
    featured: pick("featured", "featured_listings"),
    verified: pick("verified", "verified_listings", "verified_aircraft"),
    new: pick("new", "new_listings", "new_arrivals"),
    general: pick("general", "general_listings", "all", "all_listings"),
  };
}

export interface GetAllListingsParams {
  jet_type?: string;
  budget_min?: number;
  budget_max?: number;
  passengers_min?: number;
  range_min_nm?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListingsResponse {
  results: ApiListingItem[];
  total?: number;
  count?: number;
}

/** GET /listings main All Listings page (ranked Featured, Verified, Non-verified). */
export async function getAllListings(params: GetAllListingsParams = {}): Promise<ListingsResponse> {
  const raw = await apiGet<unknown>("/listings", params as Record<string, string | number>, { auth: false });

  const payload =
    raw && typeof raw === "object" && "data" in raw && raw.data !== undefined
      ? raw.data
      : raw;

  if (Array.isArray(payload)) return { results: payload as ApiListingItem[] };

  const obj = (payload as Record<string, unknown>) ?? {};
  const results = (Array.isArray(obj.results)
    ? obj.results
    : Array.isArray(obj.items)
    ? obj.items
    : []) as ApiListingItem[];

  return { results, total: obj.total as number | undefined, count: obj.count as number | undefined };
}

export function trackListingView(listingId: string) {
  return apiPost<void>(`/listings/${listingId}/view`, undefined, { auth: false }).catch(() => {});
}

export function trackListingClick(listingId: string) {
  return apiPost<void>(`/listings/${listingId}/click`, undefined, { auth: false }).catch(() => {});
}

function displayName(item: ApiListingItem): string {
  return (
    item.aircraft_name ||
    [item.manufacturer, item.model, item.variant].filter(Boolean).join(" ") ||
    "Aircraft Listing"
  );
}

function displayPrice(item: ApiListingItem): string {
  if (typeof item.price !== "number") return "Price on request";
  const millions = item.price / 1_000_000;
  return `$${millions.toFixed(1)}M`;
}

/** Maps a raw listing into the `Jet` shape used by Featured/Verified sections. */
export function toJet(item: ApiListingItem): Jet {
  return {
    id: item.listing_id || item.id,
    name: displayName(item),
    price: displayPrice(item),
    cat: item.jet_type ? String(item.jet_type).replace(/_/g, " ") : item.manufacturer || "Aircraft",
    loc: item.location_country || "Worldwide",
    image: item.thumbnail || (Array.isArray(item.media_urls) ? (item.media_urls[0] as string) : undefined) || undefined,
    description: item.short_description || item.description || undefined,
  };
}

/** Maps a raw listing into the `SfItem` shape used by AllListings / Wizard-style cards. */
export function toSfItem(item: ApiListingItem): SfItem {
  return {
    id: item.listing_id || item.id,
    name: displayName(item),
    cat: item.jet_type ? String(item.jet_type).replace(/_/g, " ") : item.manufacturer || "Aircraft",
    year: item.year_of_manufacture || 0,
    image: item.thumbnail || (Array.isArray(item.media_urls) ? (item.media_urls[0] as string) : undefined) || undefined,
    price: displayPrice(item),
    loc: item.location_country || "Worldwide",
    description: item.short_description || item.description || undefined,
  };
}

export function listingLocation(item: ApiListingItem): string {
  return item.location_country || "Worldwide";
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
  view_count: number;
  click_count: number;
  chats_initiated: number;
  created_at: string;
  manufacturer?: string | null;
  model?: string | null;
  jet_type?: string | null;
  thumbnail_url?: string | null;
  media_urls?: Record<string, unknown>[] | null;
}

export interface SellerListingsResponse {
  count: number;
  results: ListingResponse[];
}

/** GET /api/listings — the current seller's own listings (auth required). */
export async function fetchMyListings(limit = 50, offset = 0): Promise<SellerListingsResponse> {
  return apiGet<SellerListingsResponse>("/api/listings", { limit, offset }, { auth: true });
}

function sellerListingDisplayPrice(price?: number | null): string {
  if (typeof price !== "number") return "Price on request";
  return `$${(price / 1_000_000).toFixed(1)}M`;
}

export function sellerListingToJet(listing: ListingResponse): Jet {
  const name = [listing.manufacturer, listing.model, listing.variant].filter(Boolean).join(" ") || "Unnamed Asset";
  return {
    id: listing.id,
    name,
    price: sellerListingDisplayPrice(listing.price),
    cat: listing.jet_type ? String(listing.jet_type).replace(/_/g, " ") : listing.manufacturer || "Aircraft",
    loc: "Worldwide",
    image: listing.thumbnail_url || (Array.isArray(listing.media_urls) ? (listing.media_urls[0] as unknown as string) : undefined) || undefined,
    description: listing.description || undefined,
  };
}