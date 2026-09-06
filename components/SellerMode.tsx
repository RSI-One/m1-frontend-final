"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Jet } from "../lib/types";
import { useTypewriterPlaceholder } from "../lib/useTypewriterPlaceholder";
import NewListingWizard from "./NewListingWizard";
import { getMyListings, ListingResponse } from "../lib/api/sellerListings";
import { getCarousels, toJet } from "../lib/api/listings";
import { ApiError } from "../lib/api/client";
import ProfilePanel from "./ProfilePanel";
import { subscribeToNewsletter } from "@/lib/api/newsletter";

function sellerListingToJet(listing: ListingResponse): Jet {
  return {
    id: listing.id,
    name: listing.variant ? `${listing.variant} listing` : `Listing #${listing.id.slice(0, 8)}`,
    price: typeof listing.price === "number" ? `$${(listing.price / 1_000_000).toFixed(1)}M` : "Price pending",
    cat: listing.status,
    loc: listing.is_verified ? "Verified" : "Unverified",
  };
}

type SellerPanelKey = "notifications" | "menu" | "profile" | "filter" | null;

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
}){
  const [term, setTerm] = useState("");
  const [newListingOpen, setNewListingOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPlaceholder = useTypewriterPlaceholder(searchInputRef, open, term.length > 0);

  const [myListings, setMyListings] = useState<Jet[]>([]);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  const [myListingsAuthError, setMyListingsAuthError] = useState(false);

  const [trendingList, setTrendingList] = useState<Jet[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  const [openPanel, setOpenPanel] = useState<SellerPanelKey>(null);
  const navRef = useRef<HTMLElement>(null);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Portal target — SellerMode must render directly into document.body,
  // bypassing any Framer Motion (or other) ancestor that applies a
  // CSS transform. A transformed ancestor becomes the containing block
  // for position:fixed descendants, which clips/traps .seller-page
  // instead of letting it size against the real viewport — that's what
  // was cutting off the bottom of the footer and breaking scroll.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePanel = (key: SellerPanelKey) => {
    setOpenPanel((cur) => (cur === key ? null : key));
  };

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

  useEffect(() => {
    if (!openPanel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPanel(null);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [openPanel]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setMyListingsLoading(true);
    setMyListingsAuthError(false);
    getMyListings({ limit: 20 })
      .then((res) => {
        if (cancelled) return;
        setMyListings(res.results.map(sellerListingToJet));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setMyListingsAuthError(true);
        } else {
          console.error(err);
        }
      })
      .finally(() => {
        if (!cancelled) setMyListingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setTrendingLoading(true);
    getCarousels()
      .then((data) => {
        if (cancelled) return;
        setTrendingList([...data.featured, ...data.verified].map(toJet));
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setTrendingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const match = (j: Jet) => {
    const q = term.trim().toLowerCase();
    if (!q) return true;
    return j.name.toLowerCase().includes(q) || j.cat.toLowerCase().includes(q);
  };

  const activeListings = useMemo(() => myListings.filter(match).slice(0, 6), [myListings, term]);
  const filteredTrending = useMemo(() => trendingList.filter(match).slice(0, 8), [trendingList, term]);

  const card = (j: Jet, idx: number) => (
    <div className="carousel-card" key={j.name + idx} onClick={() => { onClose(); onOpenAsset(j); }}>
      {j.image && <img src={j.image} alt={j.name} />}
      <div className="carousel-card-body">
        <div className="cc-name">{j.name}</div>
        <div className="cc-meta">{j.cat}</div>
        <div className="cc-price">{j.price}</div>
      </div>
    </div>
  );

  const handleMenuItem = (label: string) => {
    showToast(label + " — opening…");
    setOpenPanel(null);
  };

  const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterStatus === "loading") return;

    setNewsletterStatus("loading");
    try {
      await subscribeToNewsletter(newsletterEmail, "seller_footer");
      setNewsletterStatus("success");
      showToast(`Subscribed — ${newsletterEmail}.`);
      setNewsletterEmail("");
    } catch (err) {
      setNewsletterStatus("error");
      const message = err instanceof Error ? err.message : "Something went wrong.";
      showToast(`Subscription failed — ${message}`);
    }
  };

  const content = (
    <div className={`seller-page ${open ? "open" : ""}`} id="sellerPage">
      <header className="navbar seller-navbar" ref={navRef}>
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

        {/* NAV UTILITY — mirrors Header.tsx's .nav-utility group exactly
            (same .icon-btn 40x40 sizing, same order: Messages -> Profile -> Menu),
            with two extra seller-only icons prepended: Notifications -> New Listing */}
        <div className="nav-utility-stack nav-utility-row">
          <button
            className="icon-btn"
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={openPanel === "notifications"}
            onClick={() => togglePanel("notifications")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="dot"></span>
          </button>
          {openPanel === "notifications" && (
            <div className="drawer show">
              <h3>Notifications</h3>
              <p>Buyer inquiries, listing status changes, and platform updates will appear here.</p>
            </div>
          )}

          <button
            id="newListingBtn"
            className="new-listing-btn"
            title="New Listing"
            aria-label="New Listing"
            onClick={() => setNewListingOpen(true)}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <button
            className="icon-btn"
            title="Messages"
            aria-label="Messages"
            onClick={onToggleChat}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="dot"></span>
          </button>

          <button
            className="icon-btn"
            title="Profile"
            aria-label="Profile"
            aria-expanded={openPanel === "profile"}
            onClick={() => togglePanel("profile")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          {openPanel === "profile" && (
            <ProfilePanel onClose={() => setOpenPanel(null)} />
          )}

          <button
            className="icon-btn"
            title="Menu"
            aria-label="Menu"
            aria-expanded={openPanel === "menu"}
            onClick={() => togglePanel("menu")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          {openPanel === "menu" && (
            <div className="drawer show">
              <h3>Menu</h3>
              <ul>
                <li className="menu-item" onClick={() => handleMenuItem("Saved Assets")}>Saved Assets</li>
                <li className="menu-item" onClick={() => handleMenuItem("Acquisition history")}>Acquisition history</li>
                <li className="menu-item" onClick={() => { setOpenPanel(null); onClose(); }}>Switch to buying mode</li>
                <li className="menu-item" onClick={() => handleMenuItem("M1 Ecosystem")}>M1 Ecosystem</li>
                <li className="menu-item" onClick={() => handleMenuItem("Report a problem")}>Report a problem</li>
                <li className="menu-item" onClick={() => handleMenuItem("Contact support")}>Contact support</li>
                <li className="menu-item" onClick={() => handleMenuItem("Join the exclusive circle")}>Join the exclusive circle</li>
              </ul>
            </div>
          )}
        </div>

        <button
          className="filters-btn"
          aria-expanded={openPanel === "filter"}
          onClick={() => togglePanel("filter")}
        >
          <span>Filters</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginLeft: 6 }}
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
        {openPanel === "filter" && (
          <div className="drawer left show">
            <h3>Filter</h3>
            <p>Filtering for your listings and trending items — refine by keyword using the search bar above.</p>
            <div className="btn-row">
              <button
                className="ghost-btn primary"
                onClick={() => {
                  setTerm("");
                  showToast("Filters cleared.");
                  setOpenPanel(null);
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        <button className="all-listings-btn active" aria-pressed="true">
          <span>All Listings</span>
        </button>
      </header>

      <section className="seller-hero" style={{ position: "relative" }}>
        <div className="container">
          <h1>Your Seller Dashboard</h1>
          <p>Manage your active listings, track buyer interest, and publish new assets.</p>
        </div>
      </section>

      <section className="carousel-section">
        <div className="container">
          <h2>Your Active Listings</h2>
          <div className="carousel-track">
            {myListingsLoading ? (
              <p style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>Loading your listings…</p>
            ) : myListingsAuthError ? (
              <p style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>
                Log in as a seller to see your listings here.
              </p>
            ) : activeListings.length ? (
              activeListings.map(card)
            ) : (
              <p style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>No matching listings.</p>
            )}
          </div>
        </div>
      </section>

      <section className="carousel-section">
        <div className="container">
          <h2>Trending on M1 Marketplace</h2>
          <div className="carousel-track">
            {trendingLoading ? (
              <p style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>Loading…</p>
            ) : filteredTrending.length ? (
              filteredTrending.map(card)
            ) : (
              <p style={{ color: "var(--muted-2)", fontSize: 12.5, padding: "10px 4px" }}>No matching listings.</p>
            )}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-brand" style={{ marginBottom: 2, flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <img src="/images/logo.png" alt="M1 Marketplace" className="brand-mark-img seller-footer-logo" />
                <div className="brand-copy"></div>
              </div>
            </div>
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

          <div className="footer-newsletter">
            <div>
              <h4>Join the exclusive circle</h4>
              <p>Curated listings, market intelligence, and off-market opportunities — delivered privately.</p>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                disabled={newsletterStatus === "loading"}
              />
              <button type="submit" disabled={newsletterStatus === "loading"}>
                {newsletterStatus === "loading" ? "Subscribing..." : newsletterStatus === "success" ? "Subscribed" : "Subscribe"}
              </button>
            </form>
          </div>

          <div className="footer-social">
            <a
            href="https://www.linkedin.com/company/m-onee/"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.8c0-1.62-.03-3.7-2.25-3.7-2.26 0-2.6 1.77-2.6 3.6V23h-4V8z" />
            </svg>
          </a>
          <a href="mailto:support@m-1.tech" aria-label="Email">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 6l10 7 10-7" />
            </svg>
          </a>
          <a href="tel:+14379945030" aria-label="Phone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
          <a
            href="https://rsinternational.net"
            aria-label="Website"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </a>
            

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

  if (!mounted) return null;
  return createPortal(content, document.body);
}