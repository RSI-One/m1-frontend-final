"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

interface SiteContextValue {
  search: string;
  setSearch: (v: string) => void;
  committedSearch: string;
  commitSearch: (v: string) => void;
  clearCommittedSearch: () => void;
  maxBudget: number;
  setMaxBudget: (v: number) => void;
  showAllListings: boolean;
  toggleShowAllListings: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);
export const BUDGET_MIN = 5;
export const BUDGET_MAX = 80;

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearchState] = useState("");
  // Only updated when the user commits a search (Enter). Listings watch this,
  // not `search`, so typing doesn't trigger a new fetch on every keystroke.
  const [committedSearch, setCommittedSearch] = useState("");
  const [maxBudget, setMaxBudget] = useState(BUDGET_MAX);
  const [showAllListings, setShowAllListings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // Clearing the search box (e.g. via "Clear filters") should also drop any
  // committed/active search results, so listings go back to the normal view.
  const setSearch = useCallback((v: string) => {
    setSearchState(v);
    if (!v.trim()) {
      setCommittedSearch("");
    }
  }, []);

  const commitSearch = useCallback((v: string) => {
    setCommittedSearch(v.trim());
  }, []);

  const clearCommittedSearch = useCallback(() => {
    setCommittedSearch("");
  }, []);

  const toggleShowAllListings = useCallback(() => {
    setShowAllListings((prev) => {
      const next = !prev;
      showToast(next ? "Showing all listings." : "Showing featured listings only.");
      return next;
    });
  }, [showToast]);

  const value = useMemo(
    () => ({
      search,
      setSearch,
      committedSearch,
      commitSearch,
      clearCommittedSearch,
      maxBudget,
      setMaxBudget,
      showAllListings,
      toggleShowAllListings,
      toast,
      showToast,
    }),
    [search, setSearch, committedSearch, commitSearch, clearCommittedSearch, maxBudget, showAllListings, toggleShowAllListings, toast, showToast]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}

export function parsePriceToM(price: string): number {
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}