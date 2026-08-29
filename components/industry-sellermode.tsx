"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Jet, ListingResponse, SellerListingsResponse } from "../lib/types";
import { useTypewriterPlaceholder } from "../lib/useTypewriterPlaceholder";
import { useSite } from "../lib/site-context";
import { api } from "../lib/api";
import NewListingWizard from "./NewListingWizard";
import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";

const DEFAULT_AVATAR = "https://res.cloudinary.com/demo/image/upload/v1/sample-avatar.png";
const NEW_LISTING_WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function formatPriceM(price: number | null): string {
  if (price === null || price === undefined) return "Price on request";
  const millions = price / 1_000_000;
  const rounded = Math.round(millions * 10) / 10;
  return `$${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
}

function formatCategory(jetType: string | null): string {
  if (!jetType) return "Uncategorized";
  return jetType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ListingResponse has no location field today, so we can't show a real one —
// rather than inventing a city, we're explicit that it's unset.
function listingToJet(l: ListingResponse): Jet {
  return {
    id: l.id,
    name: [l.manufacturer, l.model].filter(Boolean).join(" ") || "Unnamed asset",
    price: formatPriceM(l.price),
    cat: formatCategory(l.jet_type),
    loc: "Location on request",
    image: l.thumbnail_url ?? undefined,
    featured: l.is_featured,
    verified: l.is_verified,
    isNew: Date.now() - new Date(l.created_at).getTime() < NEW_LISTING_WINDOW_MS,
    isOffMarket: l.listing_type === "off_market",
  };
}

export default function SellerMode({
  open,
  onClose,
  jets,
  onOpenAsset,
  onToggleChat,
  showToast,
}: {
  open: boolean;
  onClose: () => void;
  jets: Jet[];
  onOpenAsset: (jet: Jet) => void;
  onToggleChat: () => void;
  showToast: (msg: string) => void;
}) {
  const { profile, unreadCount } = useSite();

  const [term, setTerm] = useState("");
  const [newListingOpen, setNewListingOpen] = useState(false);
  const [sellerJets, setSellerJets] = useState<Jet[] | null>(null);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPlaceholder = useTypewriterPlaceholder(searchInputRef, open, term.length > 0);

  // GET /seller/listings — the seller's own inventory, refetched every time
  // the dashboard is opened so it reflects anything changed elsewhere.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setLoadingListings(true);
    setListingsError(null);

    api
      .get<SellerListingsResponse>("/seller/listings?limit=200")
      .then((res) => {
        if (cancelled) return;
        setSellerJets(res.results.map(listingToJet));
      })
      .catch((err) => {
        if (cancelled) return;
        setListingsError(err instanceof Error ? err.message : "Couldn't load your listings.");
        setSellerJets([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingListings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !newListingOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, newListingOpen]);

  // Real data once loaded; falls back to the passed-in jets (e.g. while
  // loading, or if the fetch fails) so the dashboard never looks empty
  // for a signed-out/errored state.
  const sourceJets = sellerJets ?? jets;

  const match = (j: Jet) => {
    const q = term.trim().toLowerCase();
    if (!q) return true;
    return j.name.toLowerCase().includes(q) || j.cat.toLowerCase().includes(q);
  };

  const featuredListings = useMemo(
    () => sourceJets.filter((j) => j.featured && match(j)),
    [sourceJets, term]
  );
  const verifiedListings = useMemo(
    () => sourceJets.filter((j) => !j.featured && j.verified && match(j)),
    [sourceJets, term]
  );
  const newListings = useMemo(
    () => sourceJets.filter((j) => !j.featured && !j.verified && j.isNew && match(j)),
    [sourceJets, term]
  );
  const otherListings = useMemo(
    () => sourceJets.filter((j) => !j.featured && !j.verified && !j.isNew && match(j)),
    [sourceJets, term]
  );

  const card = (j: Jet, idx: number) => (
    <AssetCard
      key={(j.id ?? j.name) + idx}
      name={j.name}
      price={j.price}
      cat={j.cat}
      loc={j.loc}
      image={j.image}
      ribbon={j.featured ? "featured" : j.verified ? "verified" : undefined}
      minimal
      showRibbon={j.featured || j.verified}
      onClick={() => { onClose(); onOpenAsset(j); }}
    />
  );

  const avatarUrl = profile?.profile_picture_url || DEFAULT_AVATAR;
  const hasListings =
    featuredListings.length > 0 || verifiedListings.length > 0 || newListings.length > 0 || otherListings.length > 0;

  return (
    <div className={`seller-page ${open ? "open" : ""}`} id="sellerPage">
      <header className="navbar seller-navbar">
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
            <button className="icon-btn" title="Menu" aria-label="Menu" onClick={() => showToast("Menu — opening…")}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <button className="avatar-btn" title="Profile" aria-label="Profile menu" onClick={() => showToast("Profile — opening…")}>
              <img src={avatarUrl} alt="Profile" />
            </button>
          </div>
          <div className="nav-utility-row">
            <button className="icon-btn" title="Messages" aria-label="Messages" onClick={onToggleChat}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {unreadCount > 0 && <span className="dot"></span>}
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

      <section className="seller-hero">
        <div className="container">
          <h1>Your Seller Dashboard</h1>
          <p>Manage your active listings, track buyer interest, and publish new assets.</p>
        </div>
      </section>

      {loadingListings && (
        <section className="below-section">
          <div style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>Loading your listings…</div>
        </section>
      )}

      {!loadingListings && listingsError && (
        <section className="below-section">
          <div style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>{listingsError}</div>
        </section>
      )}

      {!loadingListings && featuredListings.length > 0 && (
        <section className="below-section">
          <CarouselRow headClassName="carousel-block-head" headingTag="h2" title="Featured Listings">
            {featuredListings.map(card)}
          </CarouselRow>
        </section>
      )}

      {!loadingListings && verifiedListings.length > 0 && (
        <section className="below-section">
          <CarouselRow headClassName="carousel-block-head" headingTag="h2" title="Verified Listings">
            {verifiedListings.map(card)}
          </CarouselRow>
        </section>
      )}

      {!loadingListings && newListings.length > 0 && (
        <section className="below-section">
          <CarouselRow headClassName="carousel-block-head" headingTag="h2" title="New Listings">
            {newListings.map(card)}
          </CarouselRow>
        </section>
      )}

      {!loadingListings && otherListings.length > 0 && (
        <section className="below-section">
          <CarouselRow headClassName="carousel-block-head" headingTag="h2" title="Other Listings">
            {otherListings.map(card)}
          </CarouselRow>
        </section>
      )}

      {!loadingListings && !listingsError && !hasListings && (
        <section className="below-section">
          <div style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>
            {term ? "No matching listings." : "You don't have any listings yet — create one to get started."}
          </div>
        </section>
      )}

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
                <li><a href="#" onClick={(e) => { e.preventDefault(); setNewListingOpen(true); }}>Create Listing</a></li>
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