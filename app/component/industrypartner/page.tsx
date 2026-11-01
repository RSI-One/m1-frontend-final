"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SfItem } from "@/lib/types";
import { api } from "@/lib/api";
import { sfFeatured, sfAlternative } from "@/lib/data";
import { sellerFairNews, sellerOffMarketMeta } from "@/lib/seller-data";
import { useTypewriterPlaceholder } from "@/lib/useTypewriterPlaceholder";
import AssetCard from "@/components/AssetCard";
import AssetModal from "@/components/AssetModal";
import CarouselRow from "@/components/CarouselRow";
import NewListingWizard from "@/components/NewListingWizard";
import Footer from "@/components/Footer";

const sellerMenuItems = [
  "Manage Listings",
  "Buyer Inquiries",
  "Seller Analytics",
  "Switch to buying mode",
  "M1 Ecosystem",
  "Report a problem",
  "Contact support",
  "Sign out",
];

// ---- Backend response types ----
interface ListingResponse {
  id: string;
  asset_id: string;
  seller_id: string;
  listing_type: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  price: number | null;
  total_flight_hours: number | null;
  manufacturer: string | null;
  model: string | null;
  jet_type: string | null;
  thumbnail_url: string | null;
  media_urls?: unknown;
  created_at: string;
}

interface SellerListingsResponse {
  count: number;
  results: ListingResponse[];
}

interface CarouselsResponse {
  featured?: ListingResponse[];
  verified?: ListingResponse[];
  new?: ListingResponse[];
  general?: ListingResponse[];
}

interface OffMarketListingResponse {
  id: string;
  asset_id?: string;
  price?: number | null;
  manufacturer?: string | null;
  model?: string | null;
  jet_type?: string | null;
  thumbnail_url?: string | null;
  created_at?: string;
  discount_percentage?: number | null;
  off_market_interval?: string | null;
}

interface OffMarketDbResponse {
  count?: number;
  results?: OffMarketListingResponse[];
}

interface OffMarketRow {
  item: SfItem;
  discount: string;
  interval: string;
}

function formatPrice(price: number | null | undefined, currency = "USD"): string {
  if (price === null || price === undefined) return "Price on request";
  const millions = price / 1_000_000;
  const rounded = Math.round(millions * 10) / 10;
  const amount = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  return currency === "USD" ? `$${amount}M` : `${currency} ${amount}M`;
}

function mapListingToSfItem(l: ListingResponse): SfItem {
  const modelName = `${l.manufacturer ?? ""} ${l.model ?? ""}`.trim().toLowerCase();
  const fallbackImage = modelName.includes("challenger 350") ? "/images/challenger350.jpg" : undefined;
  const mediaUrl = Array.isArray(l.media_urls) && l.media_urls[0]
    ? (typeof l.media_urls[0] === "string" ? l.media_urls[0] : (l.media_urls[0] as { url?: string })?.url)
    : undefined;

  return {
    id: l.id,
    name: `${l.manufacturer ?? ""} ${l.model ?? ""}`.trim() || "Unnamed Listing",
    cat: l.jet_type ?? "—",
    year: l.created_at ? new Date(l.created_at).getFullYear() : new Date().getFullYear(),
    image: l.thumbnail_url || mediaUrl || fallbackImage,
    price: formatPrice(l.price),
  } as SfItem;
}

function mapOffMarketToRow(l: OffMarketListingResponse): OffMarketRow {
  const modelName = `${l.manufacturer ?? ""} ${l.model ?? ""}`.trim().toLowerCase();
  const fallbackImage = modelName.includes("challenger 350") ? "/images/challenger350.jpg" : undefined;

  return {
    item: {
      id: l.id,
      name: `${l.manufacturer ?? ""} ${l.model ?? ""}`.trim() || "Unnamed Listing",
      cat: l.jet_type ?? "—",
      year: l.created_at ? new Date(l.created_at).getFullYear() : new Date().getFullYear(),
      image: l.thumbnail_url || fallbackImage,
      price: formatPrice(l.price),
    } as SfItem,
    discount: l.discount_percentage != null ? `${l.discount_percentage}% off` : "Off-Market",
    interval: l.off_market_interval ?? "",
  };
}

// TEMP: Auth bypass for local preview - helper to dedupe listings by asset_id (or model/name) and limit to 3
function dedupeAndLimit<T extends { asset_id?: string; manufacturer?: string | null; model?: string | null; id?: string }>(
  items: T[]
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const modelOrName = `${item.manufacturer ?? ""} ${item.model ?? ""}`.trim();
    const key = item.asset_id || modelOrName || item.id || "";
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    } else if (!key) {
      result.push(item);
    }
    if (result.length === 3) break;
  }
  return result;
}

export default function IndustryPartnerPage() {
  const router = useRouter();

  // This page is always "open" — it's a standalone route now, not a
  // prop-controlled overlay, so we hardcode what used to come from props.
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<SfItem | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const onClose = () => router.push("/");
  const onToggleChat = () => setChatOpen((v) => !v);
  const onOpenAsset = (item: SfItem) => {
    setSelectedAsset(item);
  };

  // Auth protection check
  useEffect(() => {
    // TEMP: Auth bypass for local preview
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      return;
    }
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("m1_access_token") || localStorage.getItem("access_token")
        : null;
    if (!token) {
      router.push("/component/industrypartner/login");
    }
  }, [router]);

  const [term, setTerm] = useState("");
  const [newListingOpen, setNewListingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPlaceholder = useTypewriterPlaceholder(searchInputRef, true, term.length > 0);

  // ---- Backend-driven state ----
  const [myListings, setMyListings] = useState<SfItem[]>([]);
  const [featuredData, setFeaturedData] = useState<SfItem[]>([]);
  const [newData, setNewData] = useState<SfItem[]>([]);
  const [trendingData, setTrendingData] = useState<SfItem[]>([]);
  const [offMarketData, setOffMarketData] = useState<OffMarketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);

  const loadSellerData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setIsDemoData(false);

    try {
      const [myListingsRes, carouselsRes, offMarketRes] = await Promise.allSettled([
        api.get<SellerListingsResponse>("/seller/listings?limit=50"),
        api.get<CarouselsResponse>("/listings/carousels"),
        api.get<OffMarketDbResponse>("/admin/databases/off-market?limit=20"),
      ]);

      let hasAnyData = false;

      // 1. Carousels (public inventory)
      if (carouselsRes.status === "fulfilled" && carouselsRes.value) {
        const c = carouselsRes.value;
        let featRaw = c.featured ?? [];
        let nRaw = c.new ?? [];
        let trRaw = c.general?.length ? c.general : (c.verified?.length ? c.verified : (c.featured ?? []));

        // TEMP: Auth bypass for local preview - drop duplicates by asset_id (fall back to model/name) and keep first 3
        if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
          featRaw = dedupeAndLimit(featRaw);
          nRaw = dedupeAndLimit(nRaw);
          trRaw = dedupeAndLimit(trRaw);
        }

        const feat = featRaw.map(mapListingToSfItem);
        const n = nRaw.map(mapListingToSfItem);
        const tr = trRaw.map(mapListingToSfItem);
        if (feat.length || n.length || tr.length) {
          hasAnyData = true;
          setFeaturedData(feat);
          setNewData(n);
          setTrendingData(tr);
        }
      }

      // 2. Off-market (admin database)
      if (offMarketRes.status === "fulfilled" && offMarketRes.value?.results?.length) {
        let offMarketRaw = offMarketRes.value.results;
        // TEMP: Auth bypass for local preview - drop duplicates by asset_id (fall back to model/name) and keep first 3
        if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
          offMarketRaw = dedupeAndLimit(offMarketRaw);
        }
        setOffMarketData(offMarketRaw.map(mapOffMarketToRow));
        hasAnyData = true;
      }

      // 3. Seller listings
      if (myListingsRes.status === "fulfilled" && myListingsRes.value?.results) {
        let myListingsRaw = myListingsRes.value.results;
        // TEMP: Auth bypass for local preview - drop duplicates by asset_id (fall back to model/name) and keep first 3
        if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
          myListingsRaw = dedupeAndLimit(myListingsRaw);
        }
        setMyListings(myListingsRaw.map(mapListingToSfItem));
        hasAnyData = true;
      } else {
        setMyListings([]);
      }

      // TEMP: Auth bypass for local preview
      if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
        const demoYachts: SfItem[] = [
          {
            id: "partner-mock-yacht-azimut",
            name: "Azimut Grande 35M",
            cat: "Yachts",
            year: 2023,
            price: "$28M",
            loc: "Monaco",
          },
          {
            id: "partner-mock-yacht-feadship",
            name: "Feadship Custom 60M",
            cat: "Yachts",
            year: 2024,
            price: "$62M",
            loc: "Athens, Greece",
          },
          {
            id: "partner-mock-yacht-benetti",
            name: "Benetti B.Now 50M",
            cat: "Yachts",
            year: 2022,
            price: "$45M",
            loc: "Cannes, France",
          },
          {
            id: "partner-mock-yacht-sunseeker",
            name: "Sunseeker 161 Yacht",
            cat: "Yachts",
            year: 2023,
            price: "$38M",
            loc: "Miami, USA",
          },
        ];

        if (myListingsRes.status === "rejected" || (myListingsRes.status === "fulfilled" && !myListingsRes.value?.results?.length)) {
          setMyListings([sfFeatured[0], sfFeatured[1], demoYachts[0]].slice(0, 3));
          setIsDemoData(true);
        }
        if (offMarketRes.status === "rejected" || !offMarketRes.value?.results?.length) {
          setOffMarketData([
            {
              item: sfAlternative[0],
              discount: sellerOffMarketMeta[0]?.discount ?? "12% off",
              interval: sellerOffMarketMeta[0]?.interval ?? "48h remaining",
            },
            {
              item: sfAlternative[1],
              discount: sellerOffMarketMeta[1]?.discount ?? "8% off",
              interval: sellerOffMarketMeta[1]?.interval ?? "5 days remaining",
            },
            {
              item: demoYachts[1],
              discount: "15% off",
              interval: "24h remaining",
            },
          ].slice(0, 3));
        }
        if (carouselsRes.status === "rejected" || !carouselsRes.value || !carouselsRes.value.featured?.length || !hasAnyData) {
          setFeaturedData([sfFeatured[2], sfFeatured[3], demoYachts[2]].slice(0, 3));
          setIsDemoData(true);
        }
        if (carouselsRes.status === "rejected" || !carouselsRes.value || !carouselsRes.value.new?.length || !hasAnyData) {
          setNewData([sfAlternative[2], sfAlternative[3], demoYachts[3]].slice(0, 3));
          setIsDemoData(true);
        }
        if (
          carouselsRes.status === "rejected" ||
          !carouselsRes.value ||
          (!carouselsRes.value.general?.length && !carouselsRes.value.verified?.length && !carouselsRes.value.featured?.length) ||
          !hasAnyData
        ) {
          setTrendingData([sfFeatured[4], sfFeatured[5], demoYachts[0]].slice(0, 3));
          setIsDemoData(true);
        }
      } else {
        if (carouselsRes.status === "rejected") {
          setLoadError("Cannot reach the server.");
        }
      }
    } catch (err) {
      console.error("Failed to load seller data:", err);
      // TEMP: Auth bypass for local preview
      if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
        const demoYachts: SfItem[] = [
          {
            id: "partner-mock-yacht-azimut",
            name: "Azimut Grande 35M",
            cat: "Yachts",
            year: 2023,
            price: "$28M",
            loc: "Monaco",
          },
          {
            id: "partner-mock-yacht-feadship",
            name: "Feadship Custom 60M",
            cat: "Yachts",
            year: 2024,
            price: "$62M",
            loc: "Athens, Greece",
          },
          {
            id: "partner-mock-yacht-benetti",
            name: "Benetti B.Now 50M",
            cat: "Yachts",
            year: 2022,
            price: "$45M",
            loc: "Cannes, France",
          },
          {
            id: "partner-mock-yacht-sunseeker",
            name: "Sunseeker 161 Yacht",
            cat: "Yachts",
            year: 2023,
            price: "$38M",
            loc: "Miami, USA",
          },
        ];

        setMyListings([sfFeatured[0], sfFeatured[1], demoYachts[0]].slice(0, 3));
        setOffMarketData([
          {
            item: sfAlternative[0],
            discount: sellerOffMarketMeta[0]?.discount ?? "12% off",
            interval: sellerOffMarketMeta[0]?.interval ?? "48h remaining",
          },
          {
            item: sfAlternative[1],
            discount: sellerOffMarketMeta[1]?.discount ?? "8% off",
            interval: sellerOffMarketMeta[1]?.interval ?? "5 days remaining",
          },
          {
            item: demoYachts[1],
            discount: "15% off",
            interval: "24h remaining",
          },
        ].slice(0, 3));
        setFeaturedData([sfFeatured[2], sfFeatured[3], demoYachts[2]].slice(0, 3));
        setNewData([sfAlternative[2], sfAlternative[3], demoYachts[3]].slice(0, 3));
        setTrendingData([sfFeatured[4], sfFeatured[5], demoYachts[0]].slice(0, 3));
        setIsDemoData(true);
      } else {
        setLoadError("Cannot reach the server.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedAsset) {
        setSelectedAsset(null);
        return;
      }
      if (newListingOpen) return;
      if (menuOpen) {
        setMenuOpen(false);
        return;
      }
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [newListingOpen, menuOpen, selectedAsset]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const match = (j: { name: string; cat: string }) => {
    const q = term.trim().toLowerCase();
    if (!q) return true;
    return j.name.toLowerCase().includes(q) || j.cat.toLowerCase().includes(q);
  };

  const activeListings = useMemo(() => myListings.filter(match), [term, myListings]);
  const trending = useMemo(() => trendingData.filter(match), [term, trendingData]);
  const newest = useMemo(() => newData.filter(match), [term, newData]);
  const featured = useMemo(() => featuredData.filter(match), [term, featuredData]);
  const offMarket = useMemo(
    () => offMarketData.filter((row: OffMarketRow) => match(row.item)),
    [term, offMarketData]
  );

  const news = sellerFairNews[newsIndex];
  const newsCount = sellerFairNews.length;

  const handleMenuItem = (label: string) => {
    setMenuOpen(false);
    if (label === "Switch to buying mode") {
      onClose();
      return;
    }
    if (label === "Sign out") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("m1_access_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_id");
      }
      router.push("/component/industrypartner/login");
      return;
    }
    showToast(label + " — opening…");
  };

  const renderEmpty = (fallbackText: string = "No matching listings.") => (
    <p style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>
      {term.trim() ? "No matching listings." : fallbackText}
    </p>
  );

  const empty = renderEmpty("No matching listings.");

  const loadingState = (
    <p style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>
      Loading…
    </p>
  );

  return (
    <>
      <div className="seller-page open" id="sellerPage">
        <header className="navbar seller-navbar" ref={headerRef}>
          <div
            className="nav-brand"
            onClick={onClose}
            style={{ cursor: "pointer" }}
            title="Return to Marketplace"
          >
            <img src="/images/logo.png" alt="M1" className="brand-mark-img" />
            <div className="brand-copy">
              <strong>Marketplace</strong>
              <span>Seller Console</span>
            </div>
          </div>

          <div className="nav-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              autoComplete="off"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <div className="nav-utility">
            <button className="icon-btn" title="Notifications" aria-label="Notifications" onClick={() => showToast("Notifications — opening…")}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="dot"></span>
            </button>
            <button id="newListingBtn" className="new-listing-btn" title="New Listing" aria-label="New Listing" onClick={() => setNewListingOpen(true)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button className="icon-btn" title="Messages" aria-label="Messages" onClick={onToggleChat}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="dot"></span>
            </button>
            <button
              className="icon-btn"
              title="Menu"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            {menuOpen && (
              <div className="drawer show">
                <h3>Menu</h3>
                <ul>
                  {sellerMenuItems.map((item) => (
                    <li key={item} className="menu-item" onClick={() => handleMenuItem(item)}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button className="avatar-btn" title="Profile" aria-label="Profile menu" onClick={() => showToast("Profile — opening…")}>
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                  if (fallback) (fallback as HTMLElement).style.display = "flex";
                }}
              />
              <span
                className="avatar-fallback"
                style={{
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </button>
          </div>

          <button className="filters-btn" onClick={() => showToast("Filters — opening…")}>
            <span>Filters</span>
          </button>
          <button className="all-listings-btn active" aria-pressed="true" onClick={() => router.push("/listings")}>
            <span>All Listings</span>
          </button>
        </header>

        <div className="seller-scroll-body">
          {/* Demo data badge */}
          {isDemoData && (
            <div className="container" style={{ paddingTop: 14 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontSize: 11,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  background: "rgba(205, 164, 94, 0.15)",
                  color: "var(--gold-2, #cda45e)",
                  border: "1px solid rgba(205, 164, 94, 0.3)",
                }}
              >
                ● Demo data (backend offline)
              </span>
            </div>
          )}

        <section className="fair-news-section">
          <div className="container">
            <div className="fair-news-frame">
              <button
                type="button"
                className="fair-news-arrow prev"
                aria-label="Previous news"
                onClick={() => setNewsIndex((i) => (i - 1 + newsCount) % newsCount)}
              >
                ←
              </button>
              <div className={`fair-news-card theme-${news.theme}`}>
                <div className="fair-news-media">
                  {news.image && <img src={news.image} alt={news.heading} />}
                  <div className="fair-news-dots" aria-label="News items">
                    {sellerFairNews.map((item, i) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`fair-news-dot ${i === newsIndex ? "active" : ""}`}
                        aria-label={`News ${i + 1}`}
                        aria-current={i === newsIndex}
                        onClick={() => setNewsIndex(i)}
                      />
                    ))}
                  </div>
                </div>
                <div className="fair-news-copy">
                  <div className="fair-news-kicker">Fair News</div>
                  <h2>{news.heading}</h2>
                  <p>{news.description}</p>
                </div>
              </div>
              <button
                type="button"
                className="fair-news-arrow next"
                aria-label="Next news"
                onClick={() => setNewsIndex((i) => (i + 1) % newsCount)}
              >
                →
              </button>
            </div>
          </div>
        </section>

        {loadError && (
          <div className="container" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <p style={{ color: "#e74c3c", fontSize: 13, margin: 0 }}>Cannot reach the server.</p>
            <button
              className="btn-sharp"
              onClick={loadSellerData}
              style={{ padding: "4px 12px", fontSize: 12 }}
            >
              Retry
            </button>
          </div>
        )}

        <section className="carousel-section">
          <div className="container">
            <CarouselRow title="Your Active Listings" headingTag="h2" headClassName="carousel-block-head">
              {loading
                ? loadingState
                : activeListings.length
                ? activeListings.map((item, idx) => (
                    <AssetCard
                      key={item.id ?? `${item.name}-${idx}`}
                      name={item.name}
                      price={item.price}
                      cat={item.cat}
                      year={item.year}
                      loc={item.loc}
                      image={item.image}
                      onClick={() => onOpenAsset(item)}
                    />
                  ))
                : renderEmpty("No active listings yet.")}
            </CarouselRow>
          </div>
        </section>

        <section className="carousel-section">
          <div className="container">
            <CarouselRow title="Trending on M1 Marketplace" headingTag="h2" headClassName="carousel-block-head">
              {loading
                ? loadingState
                : trending.length
                ? trending.map((item, idx) => (
                    <AssetCard
                      key={item.id ?? `${item.name}-${idx}`}
                      name={item.name}
                      price={item.price}
                      cat={item.cat}
                      year={item.year}
                      loc={item.loc}
                      image={item.image}
                      onClick={() => onOpenAsset(item)}
                    />
                  ))
                : renderEmpty("No trending listings yet.")}
            </CarouselRow>
          </div>
        </section>

        <section className="carousel-section">
          <div className="container">
            <CarouselRow title="Off-Market Discount" headingTag="h2" headClassName="carousel-block-head">
              {loading
                ? loadingState
                : offMarket.length
                ? offMarket.map((row: OffMarketRow, idx) => (
                    <AssetCard
                      key={row.item.id ?? `${row.item.name}-${idx}`}
                      name={row.item.name}
                      price={row.item.price}
                      cat={row.item.cat}
                      year={row.item.year}
                      loc={row.item.loc}
                      image={row.item.image}
                      ribbon="off-market"
                      discount={row.discount}
                      timeRemaining={row.interval}
                      onClick={() => onOpenAsset(row.item)}
                    />
                  ))
                : renderEmpty("No off-market listings yet.")}
            </CarouselRow>
          </div>
        </section>

        <section className="carousel-section">
          <div className="container">
            <CarouselRow title="New" headingTag="h2" headClassName="carousel-block-head">
              {loading
                ? loadingState
                : newest.length
                ? newest.map((item, idx) => (
                    <AssetCard
                      key={item.id ?? `${item.name}-${idx}`}
                      name={item.name}
                      price={item.price}
                      cat={item.cat}
                      year={item.year}
                      loc={item.loc}
                      image={item.image}
                      ribbonText="New"
                      ribbon="verified"
                      onClick={() => onOpenAsset(item)}
                    />
                  ))
                : renderEmpty("No new listings yet.")}
            </CarouselRow>
          </div>
        </section>

        <section className="carousel-section">
          <div className="container">
            <CarouselRow title="Featured" headingTag="h2" headClassName="carousel-block-head">
              {loading
                ? loadingState
                : featured.length
                ? featured.map((item, idx) => (
                    <AssetCard
                      key={item.id ?? `${item.name}-${idx}`}
                      name={item.name}
                      price={item.price}
                      cat={item.cat}
                      year={item.year}
                      loc={item.loc}
                      image={item.image}
                      ribbon="featured"
                      onClick={() => onOpenAsset(item)}
                    />
                  ))
                : renderEmpty("No featured listings yet.")}
            </CarouselRow>
          </div>
        </section>

        <Footer partnerMode onNewListing={() => setNewListingOpen(true)} />
        </div>{/* end seller-scroll-body */}

        <NewListingWizard
          open={newListingOpen}
          onClose={() => setNewListingOpen(false)}
          showToast={showToast}
        />
        <AssetModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 13,
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}