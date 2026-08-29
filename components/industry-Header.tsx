"use client";

import { useEffect, useRef, useState } from "react";
import { useSite, BUDGET_MIN, BUDGET_MAX } from "../lib/site-context";
import { useTypewriterPlaceholder } from "../lib/useTypewriterPlaceholder";
import { api } from "../lib/api";

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

const DEFAULT_AVATAR = "https://res.cloudinary.com/demo/image/upload/v1/sample-avatar.png";

export default function Header({
  onToggleChat,
  onOpenSellerMode,
}: {
  onToggleChat: () => void;
  onOpenSellerMode: () => void;
}) {
  const {
    search,
    setSearch,
    commitSearch,
    activeSuggestions,
    setActiveSuggestions,
    maxBudget,
    setMaxBudget,
    showAllListings,
    toggleShowAllListings,
    showToast,
    user,
    profile,
    unreadCount,
    refreshUser,
  } = useSite();

  const [scrolled, setScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // GET /search/suggestions?q=... — debounced live autocomplete while typing.
  useEffect(() => {
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current);

    if (!search.trim() || search.trim().length < 2) {
      setActiveSuggestions([]);
      return;
    }

    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await api.get<{ query: string; suggestions: string[] }>(
          `/search/suggestions?q=${encodeURIComponent(search.trim())}`
        );
        setActiveSuggestions(res.suggestions ?? []);
      } catch {
        // Suggestions are non-critical — fail silently.
        setActiveSuggestions([]);
      }
    }, 250);

    return () => {
      if (suggestDebounce.current) clearTimeout(suggestDebounce.current);
    };
  }, [search, setActiveSuggestions]);

  const togglePanel = (key: PanelKey) => {
    setOpenPanel((cur) => (cur === key ? null : key));
  };

  const runSearch = (value: string) => {
    setSearch(value);
    commitSearch(value);
    setSearchFocused(false);
    setActiveSuggestions([]);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitSearch(search);
      setSearchFocused(false);
    } else if (e.key === "Escape") {
      setSearchFocused(false);
    }
  };

  const handleMenuItem = async (label: string) => {
    setOpenPanel(null);

    switch (label) {
      case "Switch to selling mode": {
        try {
          await api.post("/auth/switch-mode");
          await refreshUser();
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Couldn't switch mode.");
          return;
        }
        onOpenSellerMode();
        return;
      }

      case "Saved Assets": {
        try {
          const saved = await api.get<unknown[]>("/listings/saved/me");
          showToast(`You have ${saved.length} saved asset${saved.length === 1 ? "" : "s"}.`);
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Couldn't load saved assets.");
        }
        return;
      }

      case "Acquisition history": {
        try {
          const acquisitions = await api.get<unknown[]>("/buyer/acquisitions");
          showToast(`${acquisitions.length} acquisition${acquisitions.length === 1 ? "" : "s"} in your history.`);
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Couldn't load acquisition history.");
        }
        return;
      }

      case "Join the exclusive circle": {
        try {
          await api.post("/auth/join-partner-circle", {});
          showToast("Request submitted — we'll be in touch.");
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Couldn't submit request.");
        }
        return;
      }

      case "M1 Ecosystem":
      case "Report a problem":
      case "Contact support":
      default: {
        // No dedicated screen wired up for these yet from Header — surface
        // the intent so the rest of the app can pick it up (e.g. router push
        // to /support for the latter two, once that route exists).
        showToast(label + " — opening…");
        return;
      }
    }
  };

  const handleEditProfile = async () => {
    const nextName = window.prompt("Full name", profile?.full_name ?? "");
    if (nextName === null) return;
    setProfileSaving(true);
    try {
      await api.patch("/profile/me", { full_name: nextName });
      await refreshUser();
      showToast("Profile updated.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    // There is no account-deletion endpoint in the backend today — don't
    // fake one. Route the person to support instead.
    setOpenPanel(null);
    showToast("Account deletion isn't self-serve yet — please contact support.");
  };

  const clearFilters = () => {
    setMaxBudget(BUDGET_MAX);
    setSearch("");
    showToast("Filters cleared.");
    setOpenPanel(null);
  };

  const displayName = profile?.full_name || user?.username || "Guest";
  const avatarUrl = profile?.profile_picture_url || DEFAULT_AVATAR;

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`} ref={headerRef}>
      <div className="nav-brand">
        <img src="/images/logo.png" alt="M1" className="brand-mark-img" />
        <div className="brand-copy">
          <strong>Marketplace</strong>
          <span>Seller Console</span>
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
          onFocus={() => setSearchFocused(true)}
          onKeyDown={handleSearchKeyDown}
        />
        {searchFocused && activeSuggestions.length > 0 && (
          <div className="drawer show" style={{ top: "calc(100% + 6px)", left: 0, right: "auto", minWidth: 260 }}>
            <ul>
              {activeSuggestions.map((s) => (
                <li key={s} className="menu-item" onMouseDown={() => runSearch(s)}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
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
          {unreadCount > 0 && <span className="dot"></span>}
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
          <img src={avatarUrl} alt="Profile" />
        </button>
        {openPanel === "profile" && (
          <div className="drawer show">
            <h3>Profile</h3>
            <p>{user?.email ?? "Not signed in"}</p>
            <div className="mini">
              <div>
                <div className="badge">Account</div>
                <div className="tight">
                  {displayName}
                  <br />
                  {user?.username ?? "—"}
                  <br />
                  {profile?.company_name || "No company set"}
                  <br />
                  {profile?.location || "No location set"}
                </div>
              </div>
            </div>
            <div className="btn-row">
              <button className="ghost-btn" onClick={handleEditProfile} disabled={profileSaving}>
                {profileSaving ? "Saving…" : "Edit profile"}
              </button>
              <button className="ghost-btn" onClick={handleDeleteAccount}>
                Delete account
              </button>
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