"use client";

import { jets } from "../lib/data";
import { Jet } from "../lib/types";
import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";
import { useSite, parsePriceToM } from "../lib/site-context";

export default function VerifiedSection({ onOpenAsset }: { onOpenAsset: (jet: Jet) => void }) {
  const { search, maxBudget } = useSite();

  const q = search.trim().toLowerCase();
  const filtered = jets.filter((jet) => {
    if (!jet.verified) return false;
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
      <CarouselRow headClassName="carousel-block-head" headingTag="h2" title="Verified Listings">
        {filtered.length === 0 ? (
          <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
            No listings match your search or filters.
          </div>
        ) : (
          filtered.map((jet) => (
            <AssetCard
              key={jet.name}
              name={jet.name}
              price={jet.price}
              cat={jet.cat}
              loc={jet.loc}
              image={jet.image}
              ribbon="verified"
              minimal
              showRibbon
              onClick={() => onOpenAsset(jet)}
            />
          ))
        )}
      </CarouselRow>
    </section>
  );
}
