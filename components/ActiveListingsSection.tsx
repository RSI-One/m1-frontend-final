"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import CarouselRow from "./CarouselRow";
import AssetCard from "./AssetCard";
import { Jet } from "../lib/types";
import { useSite, parsePriceToM } from "../lib/site-context";
import { getMyListings } from "../lib/api/sellerListings";
import { sellerListingToJet } from "../lib/api/listings";
import { ApiError } from "../lib/api/client";

interface ActiveListingsSectionProps {
  onOpenAsset: (jet: Jet) => void;
  onOpenNewListing: () => void;
  refreshTrigger?: number;
}

export default function ActiveListingsSection({
  onOpenAsset,
  onOpenNewListing,
  refreshTrigger = 0,
}: ActiveListingsSectionProps) {
  const { search, maxBudget, jetType, user } = useSite();
  const [listings, setListings] = useState<Jet[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);

  const loadListings = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setAuthError(false);

    getMyListings({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        setListings(res.results.map(sellerListingToJet));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setAuthError(true);
        } else {
          console.error("Error loading my listings:", err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return loadListings();
  }, [loadListings, refreshTrigger]);

  const filtered = useMemo(() => {
    return listings.filter((j) => {
      const q = search.trim().toLowerCase();
      if (q && !(j.name.toLowerCase().includes(q) || j.cat.toLowerCase().includes(q))) {
        return false;
      }
      const priceM = parsePriceToM(j.price);
      if (priceM > 0 && priceM > maxBudget) {
        return false;
      }
      if (jetType) {
        const typeClean = jetType.toLowerCase().replace(/_/g, " ");
        if (j.cat && !j.cat.toLowerCase().includes(typeClean)) {
          return false;
        }
      }
      return true;
    });
  }, [listings, search, maxBudget, jetType]);

  // If user is not logged in, don't show the seller section
  if (!user && authError) return null;

  return (
    <section className="below-section" id="active-listings">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 clamp(20px, 4vw, 64px) 12px",
          maxWidth: 1380,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h2
            style={{
              fontFamily: "var(--font-cinzel, var(--serif, serif))",
              fontSize: "clamp(20px, 2.4vw, 28px)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#fff",
              margin: 0,
            }}
          >
            Your Active Listings
          </h2>
          {listings.length > 0 && (
            <span style={{ color: "var(--gold, #d6ad5c)", fontSize: 13, fontWeight: 600 }}>
              ({listings.length})
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenNewListing}
          className="btn-sharp btn-gold"
          style={{
            padding: "8px 16px",
            fontSize: "11.5px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Publish Asset
        </button>
      </div>

      <CarouselRow headClassName="carousel-block-head" headingTag="h2">
        {loading ? (
          <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
            Loading your active fleet listings…
          </div>
        ) : authError ? (
          <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
            Sign in as an asset owner or seller to manage your published aircraft.
          </div>
        ) : listings.length === 0 ? (
          <div
            style={{
              padding: "24px 28px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px dashed rgba(255, 255, 255, 0.16)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 720,
              margin: "12px 4px",
            }}
          >
            <div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 4px 0" }}>
                No active listings published yet
              </p>
              <p style={{ color: "var(--muted, #8a94a6)", fontSize: 12.5, margin: 0 }}>
                List your private aircraft, helicopter, or yacht to reach verified high-net-worth buyers.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenNewListing}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: 8,
                color: "#fff",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 600,
                whiteSpace: "nowrap",
                transition: "all .18s ease",
              }}
            >
              + Publish Listing
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
            No listings match current search or filters.
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
              ribbon={jet.featured ? "featured" : jet.verified ? "verified" : undefined}
              minimal
              showRibbon={Boolean(jet.featured || jet.verified)}
              onClick={() => onOpenAsset(jet)}
            />
          ))
        )}
      </CarouselRow>
    </section>
  );
}

