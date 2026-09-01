// lib/mapListing.ts
import { ListingResponse } from "./types";
import { SfItem } from "./types";

export function mapListingToSfItem(l: ListingResponse): SfItem {
  return {
    name: `${l.manufacturer ?? ""} ${l.model ?? ""}`.trim() || "Unnamed Listing",
    cat: l.jet_type ?? "—",
    year: new Date(l.created_at).getFullYear(),
    image: l.thumbnail_url ?? "/images/placeholder.jpg",
    price: l.price ?? undefined,
  } as SfItem;
}