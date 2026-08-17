"use client";
import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";
import {
  sfAdditional,
  sfAlternative,
  sfFeatured,
  sfSpecsFor,
} from "../lib/data";
import { SfItem } from "../lib/types";
const listingLocations: Record<string, string> = {
  "Cessna Citation CJ3+": "Teterboro, NJ",
  "Embraer Phenom 300E": "Naples, CA",
  "HondaJet Elite II": "Greensboro, NC",
  "Cessna Citation Latitude": "Chicago, IL",
  "Bombardier Learjet 75 Liberty": "Miami, FL",
  "Pilatus PC-24": "Zurich, CH",
  "Bombardier Challenger 605": "Dubai, UAE",
  "Dassault Falcon 2000S": "Paris, FR",
  "Gulfstream G650ER": "New York, NY",
  "Bombardier Global 7500": "Montreal, CA",
  "Dassault Falcon 8X": "Los Angeles, CA",
  "Boeing Business Jet 2": "Washington, DC",
  "Airbus ACJ319neo": "Abu Dhabi, UAE",
  "Pilatus PC-12 NGX": "Denver, CO",
  "AgustaWestland AW139": "Monaco, MC",
  "Sikorsky S-92 VIP": "Houston, TX",
  "Embraer Praetor 600": "London, UK",
  "Cessna Citation Longitude": "Geneva, CH",
};
interface AllListingsProps {
  onOpenAsset: (item: SfItem) => void;
}
export default function AllListings({ onOpenAsset }: AllListingsProps) {
  const featuredListings = [...sfFeatured, ...sfAlternative.slice(0, 3)];
  const verifiedAircraft = [
    ...sfAlternative,
    ...sfAdditional,
    ...sfFeatured.slice(0, 3),
  ];
  const newArrivals = [...sfAdditional, ...sfFeatured.slice(0, 3)];
  const allAircraft = [...sfFeatured, ...sfAlternative, ...sfAdditional];
  return (
    <main className="all-listings-page">
      <section className="all-listings-content">
        <ListingSection
          title="Featured Listings"
          items={featuredListings}
          badge="featured"
          onOpenAsset={onOpenAsset}
        />
        <ListingSection
          title="Verified Aircraft"
          items={verifiedAircraft}
          badge="verified"
          rowSizes={[9, 8]}
          onOpenAsset={onOpenAsset}
        />
        <ListingSection
          title="New"
          items={newArrivals}
          badge="verified"
          onOpenAsset={onOpenAsset}
        />
        <ListingSection
          title="General Listings"
          items={allAircraft}
          badge="verified"
          rowSizes={[7, 7, 7]}
          onOpenAsset={onOpenAsset}
        />
      </section>
    </main>
  );
}
interface ListingSectionProps {
  title: string;
  items: SfItem[];
  badge: "featured" | "verified";
  rowSizes?: number[];
  onOpenAsset: (item: SfItem) => void;
}
function ListingSection({
  title,
  items,
  badge,
  rowSizes,
  onOpenAsset,
}: ListingSectionProps) {
  const sizes = rowSizes ?? [items.length];
  let start = 0;
  return (
    <section className="all-listings-section">
      <div className="all-listings-section-header">
        <h2>{title}</h2>
        <button type="button" className="all-listings-view-all">
          View All →
        </button>
      </div>
      {sizes.map((size, rowIndex) => {
        const rowItems = items.slice(start, start + size);
        start += size;
        return (
          <CarouselRow
            key={`${title}-row-${rowIndex}`}
            title=""
            small
            headClassName="all-listings-hidden-header"
          >
            {rowItems.map((item) => {
              const specs = sfSpecsFor(item);
              return (
                <AssetCard
                  key={`${title}-${rowIndex}-${item.name}`}
                  name={item.name}
                  price={specs.price}
                  cat={item.cat}
                  year={item.year}
                  loc={listingLocations[item.name] ?? "Worldwide"}
                  image={item.image}
                  ribbon={badge}
                  onClick={() => onOpenAsset(item)}
                />
              );
            })}
          </CarouselRow>
        );
      })}
    </section>
  );
}
