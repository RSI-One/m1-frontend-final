"use client";
import { useEffect, useState } from "react";
import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";
import { SfItem } from "../lib/types";
import { getCarousels, toSfItem, trackListingView } from "../lib/api/listings";

interface AllListingsProps {
  onOpenAsset: (item: SfItem) => void;
}

interface Sections {
  featured: SfItem[];
  verified: SfItem[];
  fresh: SfItem[];
  general: SfItem[];
}

export default function AllListings({ onOpenAsset }: AllListingsProps) {
  const [sections, setSections] = useState<Sections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCarousels()
      .then((data) => {
        if (cancelled) return;
        setSections({
          featured: data.featured.map(toSfItem),
          verified: data.verified.map(toSfItem),
          fresh: data.new.map(toSfItem),
          general: data.general.map(toSfItem),
        });
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Couldn't load listings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = (item: SfItem) => {
    if (item.id) trackListingView(item.id);
    onOpenAsset(item);
  };

  if (loading) {
    return (
      <main className="all-listings-page">
        <section className="all-listings-content">
          <div style={{ padding: "32px 4px", color: "var(--muted, var(--text-dim))" }}>Loading listings…</div>
        </section>
      </main>
    );
  }

  if (error || !sections) {
    return (
      <main className="all-listings-page">
        <section className="all-listings-content">
          <div style={{ padding: "32px 4px", color: "#c0392b" }}>{error ?? "Couldn't load listings."}</div>
        </section>
      </main>
    );
  }

  return (
    <main className="all-listings-page">
      <section className="all-listings-content">
        <ListingSection
          title="Featured Listings"
          items={sections.featured}
          badge="featured"
          onOpenAsset={handleOpen}
        />
        <ListingSection
          title="Verified Aircraft"
          items={sections.verified}
          badge="verified"
          rowSizes={[9, 8]}
          onOpenAsset={handleOpen}
        />
        <ListingSection
          title="New"
          items={sections.fresh}
          badge="verified"
          onOpenAsset={handleOpen}
        />
        <ListingSection
          title="General Listings"
          items={sections.general}
          badge="verified"
          rowSizes={[7, 7, 7]}
          onOpenAsset={handleOpen}
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

function ListingSection({ title, items, badge, rowSizes, onOpenAsset }: ListingSectionProps) {
  if (items.length === 0) return null;

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
        if (rowItems.length === 0) return null;
        return (
          <CarouselRow
            key={`${title}-row-${rowIndex}`}
            title=""
            small
            headClassName="all-listings-hidden-header"
          >
            {rowItems.map((item) => (
              <AssetCard
                key={item.id ?? `${title}-${rowIndex}-${item.name}`}
                name={item.name}
                cat={item.cat}
                year={item.year}
                image={item.image}
                ribbon={badge}
                onClick={() => onOpenAsset(item)}
              />
            ))}
          </CarouselRow>
        );
      })}
    </section>
  );
}