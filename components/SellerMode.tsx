"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SfItem } from "../lib/types";
import { api } from "../lib/api";
import { sellerFairNews } from "../lib/seller-data";
import { useTypewriterPlaceholder } from "../lib/useTypewriterPlaceholder";
import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";
import NewListingWizard from "./NewListingWizard";

const sellerMenuItems = [
  "Manage Listings",
  "Buyer Inquiries",
  "Seller Analytics",
  "Switch to buying mode",
  "M1 Ecosystem",
  "Report a problem",
  "Contact support",
];

//  Backend 
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

function mapListingToSfItem(l: ListingResponse): SfItem {
  return {
    name: `${l.manufacturer ?? ""} ${l.model ?? ""}`.trim() || "Unnamed Listing",
    cat: l.jet_type ?? "—",
    year: l.created_at ? new Date(l.created_at).getFullYear() : new Date().getFullYear(),
    image: l.thumbnail_url ?? "/images/placeholder.jpg",
    price: l.price ?? undefined,
  } as SfItem;
}

function mapOffMarketToRow(l: OffMarketListingResponse): OffMarketRow {
  return {
    item: {
      name: `${l.manufacturer ?? ""} ${l.model ?? ""}`.trim() || "Unnamed Listing",
      cat: l.jet_type ?? "—",
      year: l.created_at ? new Date(l.created_at).getFullYear() : new Date().getFullYear(),
      image: l.thumbnail_url ?? "/images/placeholder.jpg",
      price: l.price ?? undefined,
    } as SfItem,
    discount: l.discount_percentage != null ? `${l.discount_percentage}% off` : "Off-Market",
    interval: l.off_market_interval ?? "",
  };
}

export default function SellerMode({
  open,
  onClose,
  onOpenAsset,
  onToggleChat,
  showToast,
}: {
  open: boolean;
  onClose: () => void;
  onOpenAsset: (item: SfItem) => void;
  onToggleChat: () => void;
  showToast: (msg: string) => void;
}) {
  const [term, setTerm] = useState("");
  const [newListingOpen, setNewListingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPlaceholder = useTypewriterPlaceholder(searchInputRef, open, term.length > 0);

  // ---- Backend-driven state ----
  const [myListings, setMyListings] = useState<SfItem[]>([]);
  const [featuredData, setFeaturedData] = useState<SfItem[]>([]);
  const [newData, setNewData] = useState<SfItem[]>([]);
  const [trendingData, setTrendingData] = useState<SfItem[]>([]);
  const [offMarketData, setOffMarketData] = useState<OffMarketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function loadSellerData() {
      setLoading(true);
      setLoadError(null);
      try {
        const [myListingsRes, carouselsRes, offMarketRes] = await Promise.all([
          api.get<SellerListingsResponse>("/api/listings?limit=50"),
          api.get<CarouselsResponse>("/listings/carousels"),
          api.get<OffMarketDbResponse>("/admin/databases/off-market?limit=20"),
        ]);

        if (cancelled) return;

        setMyListings(myListingsRes.results.map(mapListingToSfItem));
        setFeaturedData((carouselsRes.featured ?? []).map(mapListingToSfItem));
        setNewData((carouselsRes.new ?? []).map(mapListingToSfItem));
        setTrendingData(
          (carouselsRes.general ?? carouselsRes.verified ?? []).map(mapListingToSfItem)
        );
        setOffMarketData((offMarketRes.results ?? []).map(mapOffMarketToRow));
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load seller data:", err);
        setLoadError("Could not load listings. Please try again.");
        showToast("Could not load listings. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSellerData();
    return () => {
      cancelled = true;
    };

  }, [open]);

  useEffect(() => {
    if (!open) {
      setMenuOpen(false);
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
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
  }, [open, onClose, newListingOpen, menuOpen]);

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

  // ---- Filtered views (now sourced from backend state) ----
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
    showToast(label + " — opening…");
  };

  const openListing = (item: SfItem) => {
    onClose();
    onOpenAsset(item);
  };

  const empty = (
    <p style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>
      No matching listings.
    </p>
  );

  const loadingState = (
    <p style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>
      Loading…
    </p>
  );

  return (
    <div className={`seller-page ${open ? "open" : ""}`} id="sellerPage">
      <header className="navbar seller-navbar" ref={headerRef}>
        <div className="nav-brand">
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

        <div className="nav-utility-stack">
          <div className="nav-utility-row">
            <button className="icon-btn" title="Notifications" aria-label="Notifications" onClick={() => showToast("Notifications — opening…")}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
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
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" />
            </button>
          </div>
          <div className="nav-utility-row">
            <button className="icon-btn" title="Messages" aria-label="Messages" onClick={onToggleChat}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <button id="newListingBtn" className="new-listing-btn" title="New Listing" aria-label="New Listing" onClick={() => setNewListingOpen(true)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <button className="filters-btn" onClick={() => showToast("Filters — opening…")}>
          <span>Filters</span>
        </button>
        <button className="all-listings-btn active" aria-pressed="true">
          <span>All Listings</span>
        </button>
      </header>

      <button className="seller-back" title="Exit Seller Mode" aria-label="Exit Seller Mode" onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

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
        <div className="container" style={{ marginTop: 8 }}>
          <p style={{ color: "#c0392b", fontSize: 12.5 }}>{loadError}</p>
        </div>
      )}

      <section className="carousel-section">
        <div className="container">
          <CarouselRow title="Your Active Listings" headingTag="h2" headClassName="carousel-block-head" small>
            {loading
              ? loadingState
              : activeListings.length
              ? activeListings.map((item) => (
                  <AssetCard
                    key={item.name}
                    name={item.name}
                    cat={item.cat}
                    year={item.year}
                    image={item.image}
                    small
                    minimal
                    onClick={() => openListing(item)}
                  />
                ))
              : empty}
          </CarouselRow>
        </div>
      </section>

      <section className="carousel-section">
        <div className="container">
          <CarouselRow title="Trending on M1 Marketplace" headingTag="h2" headClassName="carousel-block-head" small>
            {loading
              ? loadingState
              : trending.length
              ? trending.map((item) => (
                  <AssetCard
                    key={item.name}
                    name={item.name}
                    cat={item.cat}
                    year={item.year}
                    image={item.image}
                    small
                    minimal
                    onClick={() => openListing(item)}
                  />
                ))
              : empty}
          </CarouselRow>
        </div>
      </section>

      <section className="carousel-section">
        <div className="container">
          <CarouselRow title="Off-Market Discount" headingTag="h2" headClassName="carousel-block-head" small>
            {loading
              ? loadingState
              : offMarket.length
              ? offMarket.map((row: OffMarketRow) => (
                  <div className="seller-listing-card" key={row.item.name}>
                    <span className="cc-tag">Off-Market</span>
                    <AssetCard
                      name={row.item.name}
                      cat={`${row.discount} · ${row.item.cat}`}
                      year={row.item.year}
                      loc={row.interval}
                      image={row.item.image}
                      small
                      onClick={() => openListing(row.item)}
                    />
                  </div>
                ))
              : empty}
          </CarouselRow>
        </div>
      </section>

      <section className="carousel-section">
        <div className="container">
          <CarouselRow title="New" headingTag="h2" headClassName="carousel-block-head" small>
            {loading
              ? loadingState
              : newest.length
              ? newest.map((item) => (
                  <div className="seller-listing-card" key={item.name}>
                    <span className="cc-tag">New</span>
                    <AssetCard
                      name={item.name}
                      cat={item.cat}
                      year={item.year}
                      image={item.image}
                      small
                      minimal
                      onClick={() => openListing(item)}
                    />
                  </div>
                ))
              : empty}
          </CarouselRow>
        </div>
      </section>

      <section className="carousel-section">
        <div className="container">
          <CarouselRow title="Featured" headingTag="h2" headClassName="carousel-block-head" small>
            {loading
              ? loadingState
              : featured.length
              ? featured.map((item) => (
                  <AssetCard
                    key={item.name}
                    name={item.name}
                    cat={item.cat}
                    year={item.year}
                    image={item.image}
                    ribbon="featured"
                    small
                    minimal
                    showRibbon
                    onClick={() => openListing(item)}
                  />
                ))
              : empty}
          </CarouselRow>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-brand" style={{ marginBottom: 2 }}>
                <img src="/images/logo.png" alt="M1" className="brand-mark-img" />
                <div className="brand-copy">
                  <strong>M1 Marketplace</strong>
                  <span>Aviation &amp; Maritime</span>
                </div>
              </div>
              <p>
                A private acquisition engine connecting qualified buyers with verified aircraft and yacht
                sellers across the world&apos;s most exclusive fleets.
              </p>
              <p className="mission">&quot;Access, verified — for the world&apos;s rarest machines.&quot;</p>
            </div>

            <div className="footer-col">
              <h5>Seller Tools</h5>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Create Listing — coming soon."); }}>Create Listing</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Manage Listings — coming soon."); }}>Manage Listings</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Buyer Inquiries — coming soon."); }}>Buyer Inquiries</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Seller Analytics — coming soon."); }}>Seller Analytics</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Resources</h5>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Market Reports — coming soon."); }}>Market Reports</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("FAQs — coming soon."); }}>FAQs</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Documentation — coming soon."); }}>Documentation</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Blog — coming soon."); }}>Blog</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Support</h5>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Contact — coming soon."); }}>Contact</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Live Chat — coming soon."); }}>Live Chat</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Help Center — coming soon."); }}>Help Center</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Legal &amp; Policies</h5>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("SOPs — coming soon."); }}>Standard Operating Procedures (SOPs)</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Seller Policy — coming soon."); }}>Seller Policy</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("User Policy — coming soon."); }}>User Policy</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Privacy Policy — coming soon."); }}>Privacy Policy</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Terms of Service — coming soon."); }}>Terms of Service</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); showToast("Compliance — coming soon."); }}>Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 M1 Marketplace. All Rights Reserved.</span>
            <div className="links">
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("Privacy Policy — coming soon."); }}>Privacy Policy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("Terms — coming soon."); }}>Terms</a>
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("SOPs — coming soon."); }}>SOPs</a>
            </div>
            <span>Seller Console</span>
          </div>
        </div>
      </footer>

      <NewListingWizard
        open={newListingOpen}
        onClose={() => setNewListingOpen(false)}
        showToast={showToast}
      />
    </div>
  );
}