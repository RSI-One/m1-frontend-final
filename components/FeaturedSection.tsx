"use client";

import { useEffect, useState } from "react";
import { Jet } from "../lib/types";
import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";
import { useSite, parsePriceToM } from "../lib/site-context";
import { getCarousels, toJet, trackListingView } from "../lib/api/listings";
import { smartSearch, SearchResultItem } from "../lib/api/search";

function searchResultToJet(item: SearchResultItem): Jet {
  return {
    id: item.listing_id,
    name: item.aircraft_name || `${item.manufacturer || ""} ${item.model || ""}`.trim() || "Aircraft",
    price: item.price ? `$${(item.price / 1_000_000).toFixed(1)}M` : "Inquire",
    cat: item.jet_type ? item.jet_type.replace(/_/g, " ") : "Private Jet",
    loc: item.location_country || "Worldwide",
    image: item.thumbnail || "/images/hero.png",
  };
}

export default function FeaturedSection({ onOpenAsset }: { onOpenAsset: (jet: Jet) => void }) {
  const { search, setSearch, didYouMean, setDidYouMean, maxBudget, showAllListings } = useSite();

  const [featured, setFeatured] = useState<Jet[]>([]);
  const [searchResults, setSearchResults] = useState<Jet[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial featured carousel
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCarousels()
      .then((data) => {
        if (cancelled) return;
        setFeatured(data.featured.map(toJet));
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Couldn't load featured listings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // When search query is entered, perform smart search from backend
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults(null);
      setDidYouMean(null);
      return;
    }

    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await smartSearch({ q: search.trim() });
        if (cancelled) return;
        if (data.did_you_mean && data.did_you_mean.toLowerCase() !== search.trim().toLowerCase()) {
          setDidYouMean(data.did_you_mean);
        } else {
          setDidYouMean(null);
        }
        setSearchResults(data.results.map(searchResultToJet));
        setError(null);
      } catch (err) {
        console.error("Search error:", err);
        if (!cancelled) setError("Failed to perform search.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, setDidYouMean]);

  const handleOpen = (jet: Jet) => {
    if (jet.id) trackListingView(jet.id);
    onOpenAsset(jet);
  };

  const pool = searchResults !== null ? searchResults : (showAllListings ? featured : featured.slice(0, 6));
  const filtered = pool.filter((jet) => {
    const matchesBudget = parsePriceToM(jet.price) <= maxBudget;
    return matchesBudget;
  });

  const sectionTitle = search.trim()
    ? `Search Results for "${search}"`
    : "Featured Listings";

  const handleApplyDidYouMean = (correction: string) => {
    setSearch(correction);
    setDidYouMean(null);
  };

  return (
    <section className="below-section" id="featured">
      {/* Google-Style "Did you mean" Banner only shown if spelling is misspelled */}
      {search && didYouMean && didYouMean.toLowerCase() !== search.trim().toLowerCase() && (
        <div
          style={{
            maxWidth: 1380,
            margin: "0 auto 20px auto",
            padding: "12px 20px",
            background: "rgba(214,173,92,.08)",
            border: "1px solid rgba(214,173,92,.25)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "#cdd3dc",
          }}
        >
          <span style={{ color: "#8a94a6" }}>Did you mean:</span>
          <button
            type="button"
            onClick={() => handleApplyDidYouMean(didYouMean)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--gold-2)",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              fontSize: 14,
              padding: 0,
            }}
          >
            {didYouMean}
          </button>
        </div>
      )}

      <CarouselRow headClassName="carousel-block-head" headingTag="h2" title={sectionTitle}>
        {loading ? (
          <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
            {search.trim() ? "Searching aircraft fleet…" : "Loading featured listings…"}
          </div>
        ) : error ? (
          <div style={{ padding: "24px 4px", color: "#c0392b", fontSize: 13.5 }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
            No listings match &ldquo;{search}&rdquo;. Try another model or filter.
          </div>
        ) : (
          filtered.map((jet) => (
            <AssetCard
              key={jet.id ?? jet.name}
              name={jet.name}
              price={jet.price}
              cat={jet.cat}
              loc={jet.loc}
              image={jet.image}
              ribbon={search.trim() ? undefined : "featured"}
              minimal
              showRibbon={!search.trim()}
              onClick={() => handleOpen(jet)}
            />
          ))
        )}
      </CarouselRow>
    </section>
  );
}