"use client";

import { useEffect, useRef, useState } from "react";

import { useSite, BUDGET_MIN, BUDGET_MAX } from "../lib/site-context";
import { useTypewriterPlaceholder } from "../lib/useTypewriterPlaceholder";
import {
  getSearchSuggestions,
  getPopularSearches,
} from "../lib/api/search";

type PanelKey = "menu" | "profile" | "filter" | null;

const menuItems = [
  "Saved Assets",
  "Acquisition history",
  "Switch to selling mode",
  "M1 Ecosystem",
  "Report a problem",
  "Get support",
  "Join the exclusive circle",
];

type HeaderProps = {
  onToggleChat: () => void;
  onOpenSellerMode: () => void;
  onOpenReportProblem?: () => void;
  onOpenGetSupport?: () => void;
};

export default function Header({
  onToggleChat,
  onOpenSellerMode,
  onOpenReportProblem,
  onOpenGetSupport,
}: HeaderProps) {
  const {
    search,
    setSearch,
    commitSearch,
    didYouMean,
    setDidYouMean,
    activeSuggestions,
    setActiveSuggestions,
    maxBudget,
    setMaxBudget,
    showAllListings,
    toggleShowAllListings,
    showToast,
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
  const [suggestionsError, setSuggestionsError] = useState<string | null>(
    null
  );
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const list = search.trim()
      ? suggestions
      : popularKeywords;

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

  // Menu item handler
  const handleMenuItem = (label: string) => {
    if (label === "Switch to selling mode") {
      setOpenPanel(null);
      onOpenSellerMode?.();
      return;
    }

    if (label === "Report a problem") {
      setOpenPanel(null);
      onOpenReportProblem?.();
      return;
    }

    if (label === "Get support") {
      setOpenPanel(null);
      onOpenGetSupport?.();
      return;
    }

    showToast(label + " — opening…");
    setOpenPanel(null);
  };

  const clearFilters = () => {
    setMaxBudget(BUDGET_MAX);
    setSearch("");
    setDidYouMean(null);

    showToast("Filters cleared.");
    setOpenPanel(null);
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

        {/* CLEAR SEARCH */}
        {search && (
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
        )}

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
      <div className="nav-utility">
        {/* Messages */}
        <button
          className="icon-btn"
          title="Messages"
          aria-label="Messages"
          onClick={onToggleChat}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>

          <span className="dot" />
        </button>

        {/* Profile */}
        <button
          className="icon-btn"
          title="Profile"
          aria-label="Profile"
          onClick={() =>
            togglePanel("profile")
          }
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

            <circle
              cx="12"
              cy="7"
              r="4"
            />
          </svg>
        </button>

        {/* Menu */}
        <button
          className="icon-btn"
          title="Menu"
          aria-label="Menu"
          onClick={() =>
            togglePanel("menu")
          }
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <line
              x1="3"
              y1="12"
              x2="21"
              y2="12"
            />

            <line
              x1="3"
              y1="6"
              x2="21"
              y2="6"
            />

            <line
              x1="3"
              y1="18"
              x2="21"
              y2="18"
            />
          </svg>
        </button>
      </div>

      {/* ACTIONS — direct grid children of .navbar (no wrapper),
          so the .filters-btn / .all-listings-btn grid-column /
          grid-row / justify-self rules in the CSS actually apply */}
      <button
        className={`filters-btn ${
          openPanel === "filter"
            ? "active"
            : ""
        }`}
        onClick={() =>
          togglePanel("filter")
        }
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

      <button
        className={`all-listings-btn ${
          showAllListings ? "active" : ""
        }`}
        onClick={toggleShowAllListings}
      >
        <span>
          {showAllListings
            ? "Showing All"
            : "All Listings"}
        </span>
      </button>

      {/* OVERLAY */}
      {openPanel && (
        <div
          className="overlay"
          onClick={() =>
            setOpenPanel(null)
          }
        />
      )}

      {/* FILTER DRAWER */}
      {openPanel === "filter" && (
        <div className="drawer show">
          <h3>Listing Filters</h3>

          <p>
            Refine displayed fleet assets.
          </p>

          <div style={{ marginTop: 20 }}>
            <label
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <span>Max Budget</span>

              <span
                style={{
                  color: "var(--gold-2)",
                }}
              >
                ${maxBudget}M
              </span>
            </label>

            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={1}
              value={maxBudget}
              onChange={(e) =>
                setMaxBudget(
                  Number(e.target.value)
                )
              }
              style={{
                width: "100%",
                marginTop: 10,
                accentColor:
                  "var(--gold)",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: 11,
                color: "var(--muted)",
                marginTop: 4,
              }}
            >
              <span>
                ${BUDGET_MIN}M
              </span>

              <span>
                ${BUDGET_MAX}M
              </span>
            </div>
          </div>

          <div
            className="btn-row"
            style={{ marginTop: 28 }}
          >
            <button
              className="btn-sharp"
              onClick={clearFilters}
            >
              Reset
            </button>

            <button
              className="btn-sharp btn-gold"
              onClick={() =>
                setOpenPanel(null)
              }
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* PROFILE DRAWER */}
      {openPanel === "profile" && (
        <div className="drawer show">
          <h3>Private Client</h3>

          <p>
            Verified Buyer · North America
            Region
          </p>

          <div style={{ marginTop: 20 }}>
            <div className="mini">
              <div>
                <div className="badge">
                  Tier Status
                </div>

                <div className="tight">
                  M1 Black Elite
                </div>
              </div>
            </div>

            <div className="mini">
              <div>
                <div className="badge">
                  Escrow Account
                </div>

                <div className="tight">
                  Active · Ready to Deploy
                </div>
              </div>
            </div>
          </div>

          <div
            className="btn-row"
            style={{ marginTop: 24 }}
          >
            <button
              className="btn-sharp btn-gold"
              onClick={() =>
                handleMenuItem(
                  "Manage Account"
                )
              }
            >
              Manage Account
            </button>
          </div>
        </div>
      )}

      {/* MENU DRAWER */}
      {openPanel === "menu" && (
        <div className="drawer show">
          <h3>Marketplace Index</h3>

          <p>
            Global aircraft and private yacht
            transactions.
          </p>

          <ul>
            {menuItems.map((item) => (
              <li
                key={item}
                className="menu-item"
                onClick={() =>
                  handleMenuItem(item)
                }
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}