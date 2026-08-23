"use client";
import { useEffect, useState } from "react";
import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";
import { SfItem } from "../lib/types";
import { getCarousels, toSfItem, trackListingView } from "../lib/api/listings";
import { smartSearch, SearchResultItem } from "../lib/api/search";
import { useSite } from "../lib/site-context";

interface AllListingsProps {
  onOpenAsset: (item: SfItem) => void;
}

interface Sections {
  featured: SfItem[];
  verified: SfItem[];
  fresh: SfItem[];
  general: SfItem[];
}

// Maps a /search result row onto the same shape the cards already render.
function searchResultToSfItem(r: SearchResultItem): SfItem {
  return toSfItem({
    id: r.listing_id,
    name: r.aircraft_name ?? ([r.manufacturer, r.model, r.variant].filter(Boolean).join(" ") || "Listing"),
    cat: r.jet_type ?? r.manufacturer ?? "",
    year: r.year_of_manufacture ?? undefined,
    image: r.thumbnail ?? undefined,
    price: r.price ?? undefined,
  } as any);
}

export default function AllListings({ onOpenAsset }: AllListingsProps) {
  const { committedSearch, clearCommittedSearch } = useSite();

  const [sections, setSections] = useState<Sections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search mode state — active only while committedSearch is set.
  const [searchResults, setSearchResults] = useState<SfItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const isSearchMode = committedSearch.trim().length > 0;

  // Normal carousels — only needed when not searching.
  useEffect(() => {
    if (isSearchMode) return;
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
  }, [isSearchMode]);

  // Backend integration: GET /search — runs when the user commits a search (Enter).
  useEffect(() => {
    if (!isSearchMode) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    setSearchError(null);
    smartSearch({ q: committedSearch })
      .then((res) => {
        if (cancelled) return;
        setSearchResults(res.results.map(searchResultToSfItem));
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setSearchError("Couldn't load search results.");
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isSearchMode, committedSearch]);

  const handleOpen = (item: SfItem) => {
    if (item.id) trackListingView(item.id);
    onOpenAsset(item);
  };

  // --- Search mode view ---
  if (isSearchMode) {
    return (
      <main className="all-listings-page">
        <section className="all-listings-content">
          <div className="all-listings-section-header">
            <h2>Results for &ldquo;{committedSearch}&rdquo;</h2>
            <button type="button" className="all-listings-view-all" onClick={clearCommittedSearch}>
              ← Back to all listings
            </button>
          </div>
          {searchLoading ? (
            <div style={{ padding: "32px 4px", color: "var(--muted, var(--text-dim))" }}>Searching…</div>
          ) : searchError ? (
            <div style={{ padding: "32px 4px", color: "#c0392b" }}>{searchError}</div>
          ) : searchResults.length === 0 ? (
            <div style={{ padding: "32px 4px", color: "var(--muted, var(--text-dim))" }}>
              No listings match &ldquo;{committedSearch}&rdquo;.
            </div>
          ) : (
            <CarouselRow title="" small headClassName="all-listings-hidden-header">
              {searchResults.map((item) => (
                <AssetCard
                  key={item.id ?? item.name}
                  name={item.name}
                  cat={item.cat}
                  year={item.year}
                  image={item.image}
                  ribbon="verified"
                  onClick={() => handleOpen(item)}
                />
              ))}
            </CarouselRow>
          )}
        </section>
      </main>
    );
  }

  // --- Normal browsing view ---
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