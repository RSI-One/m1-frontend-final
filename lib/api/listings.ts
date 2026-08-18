
import { apiGet, apiPost } from "./client";
import { Jet, SfItem } from "../types";
export interface ApiListingItem {
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

  const pick = (...keys: string[]): ApiListingItem[] => {
    for (const key of keys) {
      const value = raw?.[key];
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

  if (Array.isArray(raw)) return { results: raw as ApiListingItem[] };

  const obj = (raw as Record<string, unknown>) ?? {};
  const results = (Array.isArray(obj.results)
    ? obj.results
    : Array.isArray(obj.items)
    ? obj.items
    : []) as ApiListingItem[];

  return { results, total: obj.total as number | undefined, count: obj.count as number | undefined };
}

/** POST /listings/{id}/view  */
export function trackListingView(listingId: string) {
  return apiPost<void>(`/listings/${listingId}/view`, undefined, { auth: false }).catch(() => {
    
  });
}

/** POST /listings/{id}/click */
export function trackListingClick(listingId: string) {
  return apiPost<void>(`/listings/${listingId}/click`, undefined, { auth: false }).catch(() => {
   
  });
}

function displayName(item: ApiListingItem): string {
  return (
    item.aircraft_name ||
    [item.manufacturer, item.model, item.variant].filter(Boolean).join(" ") ||
    "Unnamed Asset"
  );
}

function displayPrice(item: ApiListingItem): string {
  if (typeof item.price !== "number") return "Price on request";
  const millions = item.price / 1_000_000;
  return `$${millions.toFixed(1)}M`;
}

/** Maps a raw listing into the Jet shape used by Featured/Verified sections. */
/** Maps a raw listing into the `Jet` shape used by Featured/Verified sections. */
export function toJet(item: ApiListingItem): Jet {
  return {
    id: item.listing_id,
    name: displayName(item),
    price: displayPrice(item),
    cat: item.jet_type || item.manufacturer || "Aircraft",
    loc: item.location_country || "Worldwide",
    image: item.thumbnail || undefined,
    description: item.short_description || undefined,
  };
}

/** Maps a raw listing into the `SfItem` shape used by AllListings / Wizard-style cards. */
export function toSfItem(item: ApiListingItem): SfItem {
  return {
    id: item.listing_id,
    name: displayName(item),
    cat: item.jet_type || item.manufacturer || "Aircraft",
    year: item.year_of_manufacture || 0,
    image: item.thumbnail || undefined,
    price: displayPrice(item),
    loc: item.location_country || "Worldwide",
    description: item.short_description || undefined,
  };
}

export function listingLocation(item: ApiListingItem): string {
  return item.location_country || "Worldwide";
}