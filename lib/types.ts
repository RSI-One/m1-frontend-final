export interface Jet {
  /** Backend listing UUID — present when this came from the API, absent for legacy mock data. */
  id?: string;
  name: string;
  price: string;
  cat: string;
  loc: string;
  image?: string;
  /** Real listing description/blurb from the backend, when available. */
  description?: string;
}

export interface Yacht {
  name: string;
  price: string;
  cat: string;
  loc: string;
}

export interface SfItem {
  /** Backend listing UUID — present when this came from the API, absent for legacy mock data. */
  id?: string;
  name: string;
  cat: string;
  year: number;
  image?: string;
  /** Real price string (e.g. "$12.3M"), when this item came from the backend. */
  price?: string;
  /** Real location string, when this item came from the backend. */
  loc?: string;
  /** Real listing description/blurb from the backend, when available. */
  description?: string;
}

export interface CompareSpec {
  name: string;
  year: number;
  price: string;
  passengers: number;
  cabin: number;
  range: number;
  engine: string;
  cruise: number;
  maxAlt: number;
  hours: number;
  health: number;
}
// lib/apiTypes.ts
export interface ListingResponse {
  id: string;
  asset_id: string;
  seller_id: string;
  listing_type: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  price: number | null;
  manufacturer: string | null;
  model: string | null;
  jet_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface SellerListingsResponse {
  count: number;
  results: ListingResponse[];
}