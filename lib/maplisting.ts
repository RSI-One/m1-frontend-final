// lib/mapListing.ts
import { ListingResponse } from "./types";
import { SfItem } from "./types";

export function mapListingToSfItem(l: ListingResponse): SfItem {
  const modelName = `${l.manufacturer ?? ""} ${l.model ?? ""}`.trim().toLowerCase();
  const fallbackImage = modelName.includes("challenger 350") ? "/images/challenger350.jpg" : undefined;
  return {
    name: `${l.manufacturer ?? ""} ${l.model ?? ""}`.trim() || "Unnamed Listing",
    cat: l.jet_type ?? "—",
    year: new Date(l.created_at).getFullYear(),
    image: l.thumbnail_url || fallbackImage || undefined,
    price: l.price ?? undefined,
  } as SfItem;
}