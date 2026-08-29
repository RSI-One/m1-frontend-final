"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";

// ---- Minimal backend types (trimmed to the fields the UI actually uses) ----

export interface UserRead {
  id: string;
  username: string;
  email: string;
  role: "general" | "seller" | "partner_member" | "admin";
  status: "pending" | "active" | "suspended";
  email_verified_at: string | null;
  seller_mode_active: boolean;
  organization_id: string | null;
  is_flagged: boolean;
  created_at: string;
}

export interface UserProfileRead {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  location: string | null;
  profile_picture_url: string | null;
  bio: string | null;
  phone_number: string | null;
}

interface SiteContextValue {
  search: string;
  setSearch: (v: string) => void;
  committedSearch: string;
  commitSearch: (v: string) => void;
  clearCommittedSearch: () => void;
  didYouMean: string | null;
  setDidYouMean: (v: string | null) => void;
  activeSuggestions: string[];
  setActiveSuggestions: (v: string[]) => void;
  maxBudget: number;
  setMaxBudget: (v: number) => void;
  showAllListings: boolean;
  toggleShowAllListings: () => void;
  toast: string | null;
  showToast: (msg: string) => void;

  // --- backend-connected state ---
  user: UserRead | null;
  profile: UserProfileRead | null;
  isAuthLoading: boolean;
  unreadCount: number;
  refreshUser: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  setUser: (u: UserRead | null) => void;
  setProfile: (p: UserProfileRead | null) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);
export const BUDGET_MIN = 5;
export const BUDGET_MAX = 80;

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("access_token"));
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearchState] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [maxBudget, setMaxBudget] = useState(BUDGET_MAX);
  const [showAllListings, setShowAllListings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [user, setUser] = useState<UserRead | null>(null);
  const [profile, setProfile] = useState<UserProfileRead | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const setSearch = useCallback((v: string) => {
    setSearchState(v);
    if (!v.trim()) {
      setCommittedSearch("");
      setDidYouMean(null);
      setActiveSuggestions([]);
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

  // GET /auth/me + GET /profile/me
  const refreshUser = useCallback(async () => {
    if (!hasToken()) {
      setUser(null);
      setProfile(null);
      setIsAuthLoading(false);
      return;
    }
    setIsAuthLoading(true);
    try {
      const [meRes, profileRes] = await Promise.allSettled([
        api.get<UserRead>("/auth/me"),
        api.get<UserProfileRead>("/profile/me"),
      ]);
      setUser(meRes.status === "fulfilled" ? meRes.value : null);
      setProfile(profileRes.status === "fulfilled" ? profileRes.value : null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // GET /unread/count
  const refreshUnreadCount = useCallback(async () => {
    if (!hasToken()) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get<{ unread_count: number }>("/unread/count");
      setUnreadCount(res.unread_count ?? 0);
    } catch {
      // Non-fatal — leave last known count in place.
    }
  }, []);

  useEffect(() => {
    refreshUser();
    refreshUnreadCount();
  }, [refreshUser, refreshUnreadCount]);

  const value = useMemo(
    () => ({
      search,
      setSearch,
      committedSearch,
      commitSearch,
      clearCommittedSearch,
      didYouMean,
      setDidYouMean,
      activeSuggestions,
      setActiveSuggestions,
      maxBudget,
      setMaxBudget,
      showAllListings,
      toggleShowAllListings,
      toast,
      showToast,
      user,
      profile,
      isAuthLoading,
      unreadCount,
      refreshUser,
      refreshUnreadCount,
      setUser,
      setProfile,
    }),
    [
      search,
      setSearch,
      committedSearch,
      commitSearch,
      clearCommittedSearch,
      didYouMean,
      activeSuggestions,
      maxBudget,
      showAllListings,
      toggleShowAllListings,
      toast,
      showToast,
      user,
      profile,
      isAuthLoading,
      unreadCount,
      refreshUser,
      refreshUnreadCount,
    ]
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