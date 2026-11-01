"use client";

import { useEffect, useState, useCallback } from "react";
import { Jet } from "../lib/types";
import { jets } from "../lib/data";
import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";
import { useSite, parsePriceToM } from "../lib/site-context";
import { getCarousels, toJet, trackListingView } from "../lib/api/listings";

export default function VerifiedSection({ onOpenAsset }: { onOpenAsset: (jet: Jet) => void }) {
  const { search, maxBudget, showAllListings } = useSite();

  const [verified, setVerified] = useState<Jet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);

  const loadVerified = useCallback(() => {
    setLoading(true);
    setError(null);
    getCarousels()
      .then((data) => {
        setVerified(data.verified.map(toJet));
        setIsDemoData(false);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        // TEMP: Auth bypass for local preview
        if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
          setVerified(jets.slice(3, 9));
          setIsDemoData(true);
          setError(null);
        } else {
          setError("Cannot reach the server.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadVerified();
  }, [loadVerified]);

  const handleOpen = (jet: Jet) => {
    if (jet.id) trackListingView(jet.id);
    onOpenAsset(jet);
  };

  const q = search.trim().toLowerCase();
  const pool = showAllListings ? verified : verified.slice(0, 6);
  const filtered = pool.filter((jet) => {
    const matchesSearch =
      !q ||
      jet.name.toLowerCase().includes(q) ||
      jet.cat.toLowerCase().includes(q) ||
      jet.loc.toLowerCase().includes(q);
    const matchesBudget = parsePriceToM(jet.price) <= maxBudget;
    return matchesSearch && matchesBudget;
  });

  return (
    <section className="below-section" id="verified">
      <CarouselRow
        headClassName="carousel-block-head"
        headingTag="h2"
        title={isDemoData ? "Verified Listings — Demo data (backend offline)" : "Verified Listings"}
      >
        {loading ? (
          <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
            Loading verified listings…
          </div>
        ) : error ? (
          <div style={{ padding: "24px 4px", color: "#c0392b", fontSize: 13.5, display: "flex", alignItems: "center", gap: 12 }}>
            <span>{error}</span>
            <button
              type="button"
              onClick={loadVerified}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,.2)",
                color: "#e6e9ee",
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
            No listings match your search or filters.
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
              ribbon="verified"
              minimal
              showRibbon
              onClick={() => handleOpen(jet)}
            />
          ))
        )}
      </CarouselRow>
    </section>
  );
}