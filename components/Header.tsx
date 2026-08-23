"use client";

import { useEffect, useRef, useState } from "react";
import { useSite, BUDGET_MIN, BUDGET_MAX } from "../lib/site-context";
import { useTypewriterPlaceholder } from "../lib/useTypewriterPlaceholder";

type PanelKey = "menu" | "profile" | "filter" | null;

const menuItems = [
  "Saved Assets",
  "Acquisition history",
  "Switch to selling mode",
  "M1 Ecosystem",
  "Report a problem",
  "Contact support",
  "Join the exclusive circle",
];

export default function Header({
  onToggleChat,
  onOpenSellerMode,
}: {
  onToggleChat: () => void;
  onOpenSellerMode: () => void;
}) {
  const { search, setSearch, maxBudget, setMaxBudget, showAllListings, toggleShowAllListings, showToast } = useSite();

  const [scrolled, setScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPlaceholder = useTypewriterPlaceholder(searchInputRef, true, search.length > 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openPanel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPanel(null);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
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

  const togglePanel = (key: PanelKey) => {
    setOpenPanel((cur) => (cur === key ? null : key));
  };

  const handleMenuItem = (label: string) => {
    if (label === "Switch to selling mode") {
      setOpenPanel(null);
      onOpenSellerMode();
      return;
    }
    showToast(label + " — opening…");
    setOpenPanel(null);
  };

  const clearFilters = () => {
    setMaxBudget(BUDGET_MAX);
    setSearch("");
    showToast("Filters cleared.");
    setOpenPanel(null);
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`} ref={headerRef}>
      <div className="nav-brand">
        <img src="/images/logo.png" alt="M1" className="brand-mark-img" />
        <div className="brand-copy">
          <strong>Marketplace</strong>
          <span>Aviation &amp; Maritime</span>
        </div>
      </div>

      <div className="nav-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={searchPlaceholder}
          autoComplete="off"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="nav-utility">
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
          title="Menu"
          aria-label="Open menu"
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
              {menuItems.map((item) => (
                <li key={item} className="menu-item" onClick={() => handleMenuItem(item)}>
                  {item}
                </li>
              ))}
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

        <button
          className="nav-burger"
          aria-label="Open navigation"
          aria-expanded={openPanel === "menu"}
          onClick={() => togglePanel("menu")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
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
          <p>Refine the listings below by maximum budget. Applies live to Featured &amp; Verified sections.</p>
          <div className="mini" style={{ borderTop: "none", paddingTop: 4, flexDirection: "column", gap: 10 }}>
            <div className="badge">Max Budget: ${maxBudget}M</div>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={1}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
          <div className="btn-row">
            <button className="ghost-btn primary" onClick={clearFilters}>Clear filters</button>
          </div>
        </div>
      )}

      <button
        className={`all-listings-btn ${showAllListings ? "active" : ""}`}
        aria-pressed={showAllListings}
        onClick={toggleShowAllListings}
      >
        <span>All Listings</span>
      </button>
    </header>
  );
}
