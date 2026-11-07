"use client";

import { useEffect, useRef, useState } from "react";
import ProfilePanel from "./ProfilePanel";
import { useSite } from "../lib/site-context";
import { useTypewriterPlaceholder } from "../lib/useTypewriterPlaceholder";
import {
  getSearchSuggestions,
  getPopularSearches,
} from "../lib/api/search";

type PanelKey = "profile" | "notifications" | null;

type HeaderProps = {
  onToggleChat?: () => void;
  onOpenSellerMode?: () => void;
  onOpenReportProblem?: () => void;
  onOpenGetSupport?: () => void;
  onOpenAcquisitionHistory?: () => void;
};

export default function Header({
  onToggleChat,
  onOpenSellerMode,
  onOpenReportProblem,
  onOpenGetSupport,
  onOpenAcquisitionHistory,
}: HeaderProps) {
  const {
    search,
    setSearch,
    commitSearch,
    didYouMean,
    setDidYouMean,
    activeSuggestions,
    setActiveSuggestions,
    filterDrawerOpen,
    setFilterDrawerOpen,
    isFilterActive,
    profile,
  } = useSite();

  const [scrolled, setScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);

  const headerRef = useRef<HTMLElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchPlaceholder = useTypewriterPlaceholder(
    searchInputRef,
    true,
    search.length > 0
  );

  // Backend integration: Suggestions, Typo Correction, Popular Keywords
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<
    { category: string; count: number }[]
  >([]);

  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Fetch popular searches once on mount
  useEffect(() => {
    let cancelled = false;

    getPopularSearches()
      .then((res) => {
        if (cancelled) return;

        setPopularKeywords(res.popular_keywords || []);
        setTrendingCategories(res.trending_categories || []);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error("Failed to fetch popular searches:", err);
        setPopularKeywords([]);
        setTrendingCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search suggestions and typo correction
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionsError(null);
      setDidYouMean(null);
      setActiveSuggestions([]);
      return;
    }

    let cancelled = false;

    setSuggestionsLoading(true);
    setSuggestionsError(null);

    const t = setTimeout(async () => {
      try {
        const results = await getSearchSuggestions(search);

        if (cancelled) return;

        setSuggestions(results.suggestions || []);
        setDidYouMean(results.didYouMean ?? null);
        setActiveSuggestions(results.suggestions || []);
      } catch (err) {
        if (cancelled) return;

        console.error("Search suggestions failed:", err);

        setSuggestions([]);
        setSuggestionsError(
          err instanceof Error ? err.message : "Request failed"
        );
        setDidYouMean(null);
        setActiveSuggestions([]);
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false);
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, setDidYouMean, setActiveSuggestions]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Click outside to close panels and suggestions
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target)
      ) {
        setSuggestionsOpen(false);
      }

      if (
        headerRef.current &&
        !headerRef.current.contains(target)
      ) {
        setOpenPanel(null);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSuggestionsOpen(true);
      }
      if (e.key === "Escape") {
        setOpenPanel(null);
        setSuggestionsOpen(false);
        setSelectedIndex(-1);
      }
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const scrollToResults = () => {
    const el = document.getElementById("featured");

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSelectSuggestion = (sug: string) => {
    setSearch(sug);
    setSuggestionsOpen(false);
    setSelectedIndex(-1);

    searchInputRef.current?.blur();

    commitSearch(sug);
    scrollToResults();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = search.trim() ? suggestions : popularKeywords;

    if (e.key === "ArrowDown") {
      e.preventDefault();

      if (!suggestionsOpen) {
        setSuggestionsOpen(true);

        if (list.length > 0) {
          setSelectedIndex(0);
        }
      } else {
        setSelectedIndex((prev) =>
          prev < list.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      if (suggestionsOpen && list.length > 0) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : list.length - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (
        suggestionsOpen &&
        selectedIndex >= 0 &&
        selectedIndex < list.length
      ) {
        handleSelectSuggestion(list[selectedIndex]);
      } else {
        setSuggestionsOpen(false);
        searchInputRef.current?.blur();
        scrollToResults();
      }
    } else if (e.key === "Escape") {
      setSuggestionsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const togglePanel = (key: PanelKey) => {
    setOpenPanel((cur) => (cur === key ? null : key));
  };


  const runSearch = (value: string) => {
    setSuggestionsOpen(false);
    setSelectedIndex(-1);

    searchInputRef.current?.blur();

    if (value.trim()) {
      commitSearch(value);
      scrollToResults();
    }
  };

  return (
    <header
      className={`navbar ${scrolled ? "scrolled" : ""}`}
      ref={headerRef}
    >
      {/* BRAND */}
      <div className="nav-brand">
        <img
          src="/images/logo.png"
          alt="M1"
          className="brand-mark-img"
        />

        <div className="brand-copy">
          <strong>Marketplace</strong>
          <span>Aviation &amp; Maritime</span>
        </div>
      </div>

      {/* SEARCH */}
      <div
        className="nav-search"
        ref={searchContainerRef}
        style={{ position: "relative" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line
            x1="21"
            y1="21"
            x2="16.65"
            y2="16.65"
          />
        </svg>

        <input
          ref={searchInputRef}
          type="text"
          placeholder={searchPlaceholder}
          autoComplete="off"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSuggestionsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setSuggestionsOpen(true)}
          onBlur={() =>
            setTimeout(
              () => setSuggestionsOpen(false),
              200
            )
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              selectedIndex < 0
            ) {
              e.preventDefault();
              runSearch(search);
            } else {
              handleKeyDown(e);
            }
          }}
        />

        {/* CLEAR SEARCH / SHORTCUT */}
        {search ? (
          <button
            type="button"
            className="search-clear-btn"
            title="Clear search"
            aria-label="Clear search"
            onMouseDown={(e) =>
              e.preventDefault()
            }
            onClick={() => {
              setSearch("");
              setDidYouMean(null);
              setSuggestions([]);
              setActiveSuggestions([]);
              setSuggestionsOpen(false);
              setSelectedIndex(-1);
            }}
          >
            ✕
          </button>
        ) : (
          <span className="search-shortcut">⌘K</span>
        )}

        {/* Filter button directly inside Home search bar at the end */}
        <div
          style={{
            width: "1px",
            height: "16px",
            backgroundColor: "rgba(107, 99, 73, 0.35)",
            margin: "0 2px",
            flexShrink: 0,
          }}
        />
        <button
          type="button"
          onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
          className={`search-filter-btn ${isFilterActive ? "active" : ""}`}
          title="Filters"
          aria-label="Filters"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: filterDrawerOpen ? "rgba(42, 37, 23, 0.15)" : "transparent",
            border: "none",
            outline: "none",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: "999px",
            color: filterDrawerOpen || isFilterActive ? "#1a1710" : "#6b6349",
            transition: "all .18s ease",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          {isFilterActive && (
            <span
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#d6ad5c",
              }}
            />
          )}
        </button>

        {/* SEARCH DROPDOWN */}
        {suggestionsOpen && (
          <div className="nav-search-dropdown">
            {/* Loading */}
            {search.trim().length > 0 &&
              suggestionsLoading && (
                <div className="search-empty-state">
                  Searching...
                </div>
              )}

            {/* Autocomplete Suggestions */}
            {search.trim().length > 0 &&
              !suggestionsLoading &&
              suggestions.length > 0 && (
                <div className="search-dropdown-group">
                  <ul className="search-suggestions-list">
                    {suggestions.map((sug, idx) => (
                      <li
                        key={`${sug}-${idx}`}
                        className={`search-suggestion-item ${
                          selectedIndex === idx
                            ? "active"
                            : ""
                        }`}
                        onMouseDown={(e) =>
                          e.preventDefault()
                        }
                        onClick={() =>
                          handleSelectSuggestion(sug)
                        }
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle
                            cx="11"
                            cy="11"
                            r="8"
                          />

                          <line
                            x1="21"
                            y1="21"
                            x2="16.65"
                            y2="16.65"
                          />
                        </svg>

                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Popular Searches */}
            {!search.trim() &&
              popularKeywords.length > 0 && (
                <div className="search-dropdown-group">
                  <div className="search-dropdown-header">
                    Popular Searches
                  </div>

                  <div className="search-chips-container">
                    {popularKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        className="search-chip"
                        onMouseDown={(e) =>
                          e.preventDefault()
                        }
                        onClick={() =>
                          handleSelectSuggestion(kw)
                        }
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Trending Categories */}
            {!search.trim() &&
              trendingCategories.length > 0 && (
                <div
                  className="search-dropdown-group"
                  style={{ marginTop: 10 }}
                >
                  <div className="search-dropdown-header">
                    Trending Categories
                  </div>

                  <ul className="search-suggestions-list">
                    {trendingCategories.map((cat) => (
                      <li
                        key={cat.category}
                        className="search-suggestion-item"
                        onMouseDown={(e) =>
                          e.preventDefault()
                        }
                        onClick={() =>
                          handleSelectSuggestion(
                            cat.category
                          )
                        }
                      >
                        <span
                          style={{
                            fontSize: 12,
                            opacity: 0.6,
                          }}
                        >
                          ✈
                        </span>

                        <span>{cat.category}</span>

                        <span className="cat-count">
                          {cat.count} listings
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Error */}
            {search.trim().length > 0 &&
              !suggestionsLoading &&
              suggestionsError && (
                <div className="search-empty-state">
                  Press <strong>Enter</strong> to search
                  for &ldquo;{search}&rdquo;
                </div>
              )}

            {/* No Suggestions */}
            {search.trim().length > 0 &&
              !suggestionsLoading &&
              !suggestionsError &&
              suggestions.length === 0 && (
                <div className="search-empty-state">
                  Press <strong>Enter</strong> to search
                  for &ldquo;{search}&rdquo;
                </div>
              )}
          </div>
        )}
      </div>

      {/* NAV UTILITY */}
      {/* NAV UTILITY */}
      <div className="nav-utility" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Notifications */}
        <button
          className="icon-btn"
          title="Notifications"
          aria-label="Notifications"
          onClick={() => togglePanel("notifications")}
          style={{ position: "relative" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
            }}
          />
        </button>

        {/* Profile Avatar */}
        <button
          className="avatar-btn"
          title="Profile"
          aria-label="Profile"
          onClick={() => togglePanel("profile")}
        >
          <img
            src={profile?.profile_picture_url || "https://randomuser.me/api/portraits/men/32.jpg"}
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
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
        </button>
      </div>
      {/* OVERLAY */}
      {openPanel && (
        <div
          className="overlay"
          onClick={() =>
            setOpenPanel(null)
          }
        />
      )}

      {/* NOTIFICATIONS DRAWER */}
      {openPanel === "notifications" && (
        <div className="drawer show" style={{ zIndex: 820 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Notifications</h3>
            <button
              type="button"
              onClick={() => setOpenPanel(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                fontSize: 16,
                cursor: "pointer",
                padding: "2px 6px",
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p>Buyer inquiries, listing status changes, and platform updates will appear here.</p>
        </div>
      )}

      {/* PROFILE DRAWER */}
      {openPanel === "profile" && (
        <ProfilePanel
          onClose={() => setOpenPanel(null)}
          onOpenNotifications={() => setOpenPanel("notifications")}
        />
      )}
    </header>
  );
}