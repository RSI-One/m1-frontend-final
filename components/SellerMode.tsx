"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Jet } from "../lib/types";
import { useTypewriterPlaceholder } from "../lib/useTypewriterPlaceholder";
import NewListingWizard from "./NewListingWizard";
import { getMyListings, ListingResponse } from "../lib/api/sellerListings";
import { getCarousels, toJet } from "../lib/api/listings";
import { ApiError } from "../lib/api/client";

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

  // Seller's own listings
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

  // "Trending" — no dedicated backend endpoint yet, so reuse the public
  // featured/verified carousel as a reasonable stand-in.
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

  return (
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

        <div className="nav-utility-stack">
          <div className="nav-utility-row">
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

            <button
              className="avatar-btn"
              title="Profile"
              aria-label="Profile menu"
              aria-expanded={openPanel === "profile"}
              onClick={() => togglePanel("profile")}
            >
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" />
            </button>
            {openPanel === "profile" && (
              <div className="drawer show">
                <h3>Profile</h3>
                <p>Full name, username, company, and location. Edit profile, credentials, and account actions live here.</p>
                <div className="mini">
                  <div>
                    <div className="badge">Account</div>
                    <div className="tight">Full name<br />Username<br />Company name<br />Location</div>
                  </div>
                </div>
                <div className="btn-row">
                  <button className="ghost-btn" onClick={() => handleMenuItem("Edit profile")}>Edit profile</button>
                  <button className="ghost-btn" onClick={() => handleMenuItem("Delete account")}>Delete account</button>
                </div>
              </div>
            )}
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

        <button
          className="filters-btn"
          aria-expanded={openPanel === "filter"}
          onClick={() => togglePanel("filter")}
        >
          <span>Filters</span>
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

      <button className="seller-back" title="Exit Seller Mode" aria-label="Exit Seller Mode" onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

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