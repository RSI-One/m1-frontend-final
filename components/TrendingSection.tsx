"use client";

import { useEffect, useState, useMemo } from "react";
import { Jet } from "../lib/types";
import { jets } from "../lib/data";
import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";
import { useSite, parsePriceToM } from "../lib/site-context";
import { getCarousels, toJet, trackListingView } from "../lib/api/listings";

export default function TrendingSection({ onOpenAsset }: { onOpenAsset: (jet: Jet) => void }) {
  const { search, maxBudget, jetType, showAllListings } = useSite();

  const [trending, setTrending] = useState<Jet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getCarousels()
      .then((data) => {
        if (cancelled) return;
        const combined = [
          ...(data.featured || []),
          ...(data.verified || []),
          ...(data.new || []),
        ];
        // Deduplicate by id or model
        const seen = new Set<string>();
        const unique = combined.filter((item) => {
          const key = item.id || `${item.manufacturer}-${item.model}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const list = unique.map(toJet);
        setTrending(list.length > 0 ? list : jets);
        setError(null);
      })
      .catch((err) => {
        console.error("Error loading trending listings:", err);
        if (!cancelled) {
          setTrending(jets);
          setError(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = (jet: Jet) => {
    if (jet.id) trackListingView(jet.id);
    onOpenAsset(jet);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pool = showAllListings ? trending : trending;

    return pool.filter((jet) => {
      const matchesSearch =
        !q ||
        jet.name.toLowerCase().includes(q) ||
        jet.cat.toLowerCase().includes(q) ||
        jet.loc.toLowerCase().includes(q);
      const matchesBudget = parsePriceToM(jet.price) <= maxBudget;
      if (jetType) {
        const typeClean = jetType.toLowerCase().replace(/_/g, " ");
        if (jet.cat && !jet.cat.toLowerCase().includes(typeClean)) {
          return false;
        }
      }
      return matchesSearch && matchesBudget;
    });
  }, [trending, search, maxBudget, jetType, showAllListings]);

  if (!loading && filtered.length === 0 && !search.trim()) return null;

  return (
    <section className="below-section" id="trending">
      <CarouselRow headClassName="carousel-block-head" headingTag="h2" title="Trending on M1 Marketplace">
        {loading ? (
          <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
            Loading trending listings…
          </div>
        ) : error ? (
          <div style={{ padding: "24px 4px", color: "#c0392b", fontSize: 13.5 }}>{error}</div>
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
              ribbon={jet.featured ? "featured" : jet.verified ? "verified" : undefined}
              minimal
              showRibbon={Boolean(jet.featured || jet.verified)}
              onClick={() => handleOpen(jet)}
            />
          ))
        )}
      </CarouselRow>
    </section>
  );
}
