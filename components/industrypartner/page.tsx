"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "components/industry-Header";
import NewsCard from "components/NewsCard";
import AllListings from "components/AllListings";
import Footer from "components/Footer";
import AssetModal from "components/AssetModal";
import CompareModal from "components/CompareModal";
import Toast from "components/Toast";
import MessagingPage from "components/MessagingPage";
import SellerMode from "components/industry-sellermode";
import { SiteProvider, useSite, parsePriceToM } from "@/lib/site-context";
import { Jet, SfItem, ListingResponse } from "@/lib/types";
import { jets as staticJets, sfAlternative } from "@/lib/data";
import { api } from "@/lib/api";
import AssetCard from "components/AssetCard";
import CarouselRow from "components/CarouselRow";
import NewListingWizard from "components/NewListingWizard";

export default function Page() {
  return (
    <SiteProvider>
      <PageInner />
    </SiteProvider>
  );
}

// --- Typed per the OpenAPI spec's SmartSearchResponse/SearchResultItem ---
interface SearchResultItem {
  listing_id: string;
  aircraft_name?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  jet_type?: string | null;
  thumbnail?: string | null;
  price?: number | null;
  currency?: string;
  is_verified?: boolean;
  featured_status?: boolean;
  short_description?: string | null;
  location_country?: string | null;
  listing_type?: "on_market" | "off_market" | null;
}

interface SmartSearchResponse {
  total: number;
  results: SearchResultItem[];
}

function formatPrice(price: number | null | undefined, currency = "USD"): string {
  if (price === null || price === undefined) return "Price on request";
  const millions = price / 1_000_000;
  const rounded = Math.round(millions * 10) / 10;
  const amount = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  return currency === "USD" ? `$${amount}M` : `${currency} ${amount}M`;
}

function formatCategory(jetType: string | null | undefined): string {
  if (!jetType) return "Uncategorized";
  return jetType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function searchResultToJet(item: SearchResultItem): Jet {
  return {
    id: item.listing_id,
    name: item.aircraft_name || [item.manufacturer, item.model].filter(Boolean).join(" ") || "Unnamed asset",
    price: formatPrice(item.price, item.currency),
    cat: formatCategory(item.jet_type),
    loc: item.location_country || "Location on request",
    image: item.thumbnail ?? undefined,
    description: item.short_description ?? undefined,
    featured: Boolean(item.featured_status),
    verified: Boolean(item.is_verified),
    isOffMarket: item.listing_type === "off_market",
  };
}

// /listings/carousels has no typed schema in the spec, so we defensively
// check the "new" bucket looks like a list of ListingResponse-shaped
// objects (the one canonical listing shape used elsewhere in the API)
// before trusting it. If it doesn't match, we just skip it — no crash, no
// invented data.
function isListingResponseShaped(item: unknown): item is ListingResponse {
  if (!item || typeof item !== "object") return false;
  const obj = item as Record<string, unknown>;
  return typeof obj.id === "string" && ("manufacturer" in obj || "model" in obj);
}

function listingResponseToJet(l: ListingResponse): Jet {
  return {
    id: l.id,
    name: [l.manufacturer, l.model].filter(Boolean).join(" ") || "Unnamed asset",
    price: formatPrice(l.price),
    cat: formatCategory(l.jet_type),
    loc: "Location on request", // ListingResponse has no location field
    image: l.thumbnail_url ?? undefined,
    featured: l.is_featured,
    verified: l.is_verified,
    isNew: true, // came from the carousels "new" bucket by definition
    isOffMarket: l.listing_type === "off_market",
  };
}

function PageInner() {
  const { showToast, showAllListings, search, maxBudget } = useSite();
  const [selectedAsset, setSelectedAsset] = useState<Jet | SfItem | null>(null);
  const [compareItems, setCompareItems] = useState<SfItem[]>([]);
  const [sellerModeOpen, setSellerModeOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);

  // GET /search — powers Featured + Off-Market buckets with real, typed data.
  const [liveSearchJets, setLiveSearchJets] = useState<Jet[] | null>(null);
  // GET /listings/carousels — best-effort source for the New bucket.
  const [liveNewJets, setLiveNewJets] = useState<Jet[] | null>(null);
  const [listingsError, setListingsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<SmartSearchResponse>("/search?page_size=100&sort=relevance")
      .then((res) => {
        if (cancelled) return;
        setLiveSearchJets((res.results || []).map(searchResultToJet));
      })
      .catch((err) => {
        if (cancelled) return;
        setListingsError(err instanceof Error ? err.message : "Couldn't load listings.");
        // Leave liveSearchJets as null so we fall back to the static list.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Record<string, unknown>>("/listings/carousels")
      .then((res) => {
        if (cancelled) return;
        const raw = res?.new;
        if (Array.isArray(raw)) {
          const mapped = raw.filter(isListingResponseShaped).map(listingResponseToJet);
          if (mapped.length > 0) setLiveNewJets(mapped);
        }
      })
      .catch(() => {
        // Non-critical — the New bucket just falls back to static data.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge the two live sources into one dataset, same shape the static
  // `jets` array had (a flat list with featured/verified/isNew/isOffMarket
  // flags), so every downstream consumer (this page + SellerMode) keeps
  // working unchanged.
  const sourceJets = useMemo<Jet[]>(() => {
    if (!liveSearchJets) return staticJets;
    const byKey = new Map<string, Jet>();
    liveSearchJets.forEach((j) => byKey.set(j.id ?? j.name, j));
    (liveNewJets ?? []).forEach((j) => {
      const key = j.id ?? j.name;
      const existing = byKey.get(key);
      byKey.set(key, existing ? { ...existing, isNew: true } : j);
    });
    return Array.from(byKey.values());
  }, [liveSearchJets, liveNewJets]);

  const openAssetFromSf = (item: SfItem) => setSelectedAsset(item);
  const openAssetFromJet = (jet: Jet) => setSelectedAsset(jet);
  const closeAssetModal = () => setSelectedAsset(null);
  const openCompareModal = (items: SfItem[]) => setCompareItems(items);
  const closeCompareModal = () => setCompareItems([]);

  const q = search.trim().toLowerCase();
  const matchJet = (jet: Jet) => {
    const matchesSearch =
      !q ||
      jet.name.toLowerCase().includes(q) ||
      jet.cat.toLowerCase().includes(q) ||
      jet.loc.toLowerCase().includes(q);
    const matchesBudget = parsePriceToM(jet.price) <= maxBudget;
    return matchesSearch && matchesBudget;
  };

  const offMarketJets = sourceJets.filter((j) => j.isOffMarket && matchJet(j));
  const newJets = sourceJets.filter((j) => j.isNew && !j.featured && !j.verified && matchJet(j));
  const featuredJets = sourceJets.filter((j) => j.featured && matchJet(j));

  return (
    <>
      <Header
        onToggleChat={() => setMessagingOpen(true)}
        onOpenSellerMode={() => setSellerModeOpen(true)}
      />

      {!showAllListings && <NewsCard />}

      {listingsError && (
        <div style={{ padding: "8px 24px", color: "var(--muted, var(--text-dim))", fontSize: 12.5 }}>
          {listingsError} — showing cached listings.
        </div>
      )}

      {showAllListings ? (
        <AllListings onOpenAsset={openAssetFromSf} />
      ) : (
        <>
          <section className="below-section" id="off-market">
            <CarouselRow headClassName="carousel-block-head" headingTag="h2" title="Off Market Listing">
              {offMarketJets.length === 0 ? (
                <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
                  No listings match your search or filters.
                </div>
              ) : (
                offMarketJets.map((jet) => (
                  <AssetCard
                    key={jet.id ?? jet.name}
                    name={jet.name}
                    price={jet.price}
                    cat={jet.cat}
                    loc={jet.loc}
                    image={jet.image}
                    minimal
                    ribbon="off-market"
                    showRibbon
                    onClick={() => openAssetFromJet(jet)}
                  />
                ))
              )}
            </CarouselRow>
          </section>

          <section className="below-section" id="new-listings">
            <CarouselRow headClassName="carousel-block-head" headingTag="h2" title="New Listing">
              {newJets.length === 0 ? (
                <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
                  No listings match your search or filters.
                </div>
              ) : (
                newJets.map((jet, index) => {
                  const themes = ["purple", "pink", "teal", "coral", "caramel"] as const;
                  const theme = themes[index % themes.length];
                  return (
                    <AssetCard
                      key={jet.id ?? jet.name}
                      name={jet.name}
                      price={jet.price}
                      cat={jet.cat}
                      loc={jet.loc}
                      image={jet.image}
                      minimal
                      colorTheme={theme}
                      onClick={() => openAssetFromJet(jet)}
                    />
                  );
                })
              )}
            </CarouselRow>
          </section>

          <section className="below-section" id="featured">
            <CarouselRow headClassName="carousel-block-head" headingTag="h2" title="Featured">
              {featuredJets.length === 0 ? (
                <div style={{ padding: "24px 4px", color: "var(--muted, var(--text-dim))", fontSize: 13.5 }}>
                  No listings match your search or filters.
                </div>
              ) : (
                featuredJets.map((jet) => (
                  <AssetCard
                    key={jet.id ?? jet.name}
                    name={jet.name}
                    price={jet.price}
                    cat={jet.cat}
                    loc={jet.loc}
                    image={jet.image}
                    ribbon="featured"
                    minimal
                    showRibbon
                    onClick={() => openAssetFromJet(jet)}
                  />
                ))
              )}
            </CarouselRow>
          </section>
        </>
      )}

      <Footer />

      <AssetModal asset={selectedAsset} onClose={closeAssetModal} />
      <CompareModal items={compareItems} onClose={closeCompareModal} />

      <SellerMode
        open={sellerModeOpen}
        onClose={() => setSellerModeOpen(false)}
        jets={sourceJets}
        onOpenAsset={openAssetFromJet}
        onToggleChat={() => setMessagingOpen(true)}
        showToast={showToast}
      />

      <Toast />
      <MessagingPage open={messagingOpen} onClose={() => setMessagingOpen(false)} />
    </>
  );
}