"use client";

import { useEffect, useMemo, useRef, useState, useCallback, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Jet } from "../lib/types";
import { useSite, parsePriceToM } from "../lib/site-context";
import { useTypewriterPlaceholder } from "../lib/useTypewriterPlaceholder";
import NewListingWizard from "./NewListingWizard";
import { getMyListings } from "../lib/api/sellerListings";
import { getCarousels, toJet, sellerListingToJet } from "../lib/api/listings";
import { ApiError } from "../lib/api/client";
import ProfilePanel from "./ProfilePanel";
import AssetCard from "./AssetCard";
import { subscribeToNewsletter } from "@/lib/api/newsletter";
import { FooterJetThrustFire } from "./Footer";
import SavedAssetsModal from "./SavedAssetsModal";
import EcosystemModal from "./EcosystemModal";

type SellerPanelKey = "notifications" | "menu" | "profile" | "filter" | null;

export default function SellerMode({
  open,
  onClose,
  jets,
  onOpenAsset,
  onToggleChat,
  showToast,
  onOpenAcquisitionHistory,
  onOpenReportProblem,
  onOpenGetSupport,
}: {
  open: boolean;
  onClose: () => void;
  jets: Jet[];
  onOpenAsset: (jet: Jet) => void;
  onToggleChat: () => void;
  showToast: (msg: string) => void;
  onOpenAcquisitionHistory?: () => void;
  onOpenReportProblem?: () => void;
  onOpenGetSupport?: () => void;
}) {
  const router = useRouter();
  const {
    filterDrawerOpen,
    setFilterDrawerOpen,
    isFilterActive,
    maxBudget,
    jetType,
  } = useSite();

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
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const [hiddenAtBottom, setHiddenAtBottom] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [savedAssetsOpen, setSavedAssetsOpen] = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);
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
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && !newListingOpen) {
        if (openPanel) {
          setOpenPanel(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, newListingOpen, openPanel]);

  // Click outside to close panels
  useEffect(() => {
    if (!openPanel) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".drawer") || target.closest(".navbar") || target.closest("nav[aria-label='Seller Actions Navigation']")) {
        return;
      }
      setOpenPanel(null);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [openPanel]);

  // Bottom scroll detection inside seller-scroll-body
  useEffect(() => {
    const el = scrollBodyRef.current;
    if (!el || !open) return;

    const handleScroll = () => {
      const scrollY = el.scrollTop;
      const viewportHeight = el.clientHeight;
      const scrollHeight = el.scrollHeight;

      if (scrollY + viewportHeight >= scrollHeight - 80) {
        setHiddenAtBottom(true);
      } else {
        setHiddenAtBottom(false);
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [open]);

  const loadMyListings = useCallback(() => {
    let cancelled = false;
    setMyListingsLoading(true);
    setMyListingsAuthError(false);
    getMyListings({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        setMyListings(res.results.map(sellerListingToJet));
      })
      .catch((err) => {
        if (cancelled) return;
        // TEMP: Auth bypass for local preview
        if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
          setMyListings(jets.slice(0, 3));
          setMyListingsAuthError(false);
        } else if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
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
  }, []);

  useEffect(() => {
    if (!open) return;
    return loadMyListings();
  }, [open, loadMyListings]);

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

  // Video background control for footer
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!open) return;
    const video = videoRef.current;
    if (!video) return;

    const applySpeed = () => {
      try {
        video.playbackRate = 1.0;
      } catch (err) {
        console.error("PlaybackRate error:", err);
      }
    };

    const startPlay = () => {
      video.play().catch(() => {});
    };

    const handleTimeUpdate = () => {
      if (video.currentTime >= 10.0 && video.currentTime < 20.0) {
        video.currentTime = 20.0;
      } else if (video.currentTime >= 55.0) {
        video.currentTime = 0.0;
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      startPlay();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("loadedmetadata", applySpeed);
    video.addEventListener("play", applySpeed);
    video.addEventListener("canplay", applySpeed);
    startPlay();

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadedmetadata", applySpeed);
      video.removeEventListener("play", applySpeed);
      video.removeEventListener("canplay", applySpeed);
    };
  }, [open]);

  const match = (j: Jet) => {
    const q = term.trim().toLowerCase();
    if (q && !(j.name.toLowerCase().includes(q) || j.cat.toLowerCase().includes(q))) {
      return false;
    }
    const priceM = parsePriceToM(j.price);
    if (priceM > 0 && priceM > maxBudget) {
      return false;
    }
    if (jetType) {
      const typeClean = jetType.toLowerCase().replace(/_/g, " ");
      if (j.cat && !j.cat.toLowerCase().includes(typeClean)) {
        return false;
      }
    }
    return true;
  };

  const activeListings = useMemo(() => myListings.filter(match).slice(0, 6), [myListings, term, maxBudget, jetType]);
  const filteredTrending = useMemo(() => trendingList.filter(match).slice(0, 8), [trendingList, term, maxBudget, jetType]);

  const card = (j: Jet, idx: number) => (
    <AssetCard
      key={j.id ?? (j.name + idx)}
      name={j.name}
      price={j.price}
      cat={j.cat}
      loc={j.loc}
      image={j.image}
      ribbon={j.featured ? "featured" : j.verified ? "verified" : undefined}
      minimal
      showRibbon={Boolean(j.featured || j.verified)}
      onClick={() => onOpenAsset(j)}
    />
  );

  const handleMenuItem = (label: string) => {
    if (label === "Switch to buying mode") {
      setOpenPanel(null);
      onClose();
      return;
    }

    if (label === "Saved Assets") {
      setOpenPanel(null);
      setSavedAssetsOpen(true);
      return;
    }

    if (label === "M1 Ecosystem") {
      setOpenPanel(null);
      setEcosystemOpen(true);
      return;
    }

    if (label === "Join the exclusive circle") {
      setOpenPanel(null);
      const input = document.querySelector(".seller-mode-body input[type='email']");
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        (input as HTMLInputElement).focus();
      }
      return;
    }

    if (label === "Acquisition history") {
      setOpenPanel(null);
      onOpenAcquisitionHistory?.();
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
      {/* Back button to leave seller mode */}
      <button
        className="seller-back"
        title="Back to Buying"
        aria-label="Back to Buying"
        onClick={onClose}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      {/* ── Scrollable Body: Header is first child inside, so it scrolls away naturally ── */}
      <div className="seller-scroll-body" ref={scrollBodyRef}>
        {/* ── Top Seller Header (Relative, Brand, Search, Profile) ── */}
        <header className="navbar seller-navbar" ref={navRef}>
          <div
            className="nav-brand"
            onClick={() => {
              setOpenPanel(null);
              onClose();
            }}
            style={{ cursor: "pointer" }}
            title="Return to Marketplace"
          >
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
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            {term ? (
              <button
                type="button"
                className="search-clear-btn"
                title="Clear search"
                aria-label="Clear search"
                onClick={() => setTerm("")}
              >
                ✕
              </button>
            ) : (
              <span className="search-shortcut">⌘K</span>
            )}

            {/* Filter button directly inside Search bar at the end */}
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
              onClick={() => {
                setOpenPanel(null);
                setFilterDrawerOpen(!filterDrawerOpen);
              }}
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
          </div>

          {/* Profile & Notifications in Top Right Corner */}
          <div className="nav-utility" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="icon-btn"
              title="Notifications"
              aria-label="Notifications"
              aria-expanded={openPanel === "notifications"}
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
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="seller-hero" style={{ position: "relative" }}>
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1>Your Seller Dashboard</h1>
              <p>Manage your active listings, track buyer interest, and publish new assets.</p>
            </div>
            <button
              className="ghost-btn"
              onClick={onClose}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span>← Switch to Buying Mode</span>
            </button>
          </div>
        </section>

        {/* ── Active Listings Carousel ── */}
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

        {/* ── Trending Section ── */}
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

        {/* ── Seller Footer (Matching Main Footer with Jets & Video & Glassmorphism, Preserving Seller Content) ── */}
        <footer className="relative bg-black text-zinc-400 border-t border-zinc-900 pt-44 sm:pt-48 pb-20 sm:pb-28 overflow-hidden select-none">
          {/* Background Video */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
            src="/videos/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />

          <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />

          {/* Left Supersonic Jet */}
          <div className="absolute left-[-25px] sm:left-0 md:left-6 lg:left-12 top-[-52px] sm:top-[-38px] md:top-[-32px] lg:top-[-28px] w-[340px] sm:w-[460px] md:w-[560px] lg:w-[640px] h-[230px] sm:h-[310px] md:h-[380px] lg:h-[430px] z-10 group pointer-events-auto cursor-pointer">
            <div className="relative w-full h-full flex items-center justify-center rotate-[12deg] transition-transform duration-500 ease-out group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-[14deg] animate-flight-bob-left animate-[flightBobLeft_4.5s_ease-in-out_infinite]">
              <div className="relative w-full aspect-[1376/768]">
                <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
                  <span className="absolute top-[35%] left-[25%] w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent blur-[0.5px] animate-slipstream animate-[slipstream_1.4s_linear_infinite]" />
                  <span className="absolute top-[48%] left-[45%] w-24 sm:w-36 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent blur-[0.5px] animate-slipstream animate-[slipstream_1.1s_linear_infinite] delay-300" />
                  <span className="absolute top-[62%] left-[18%] w-20 sm:w-28 h-[1.5px] bg-gradient-to-r from-transparent via-sky-300/70 to-transparent blur-[0.5px] animate-slipstream animate-[slipstream_1.7s_linear_infinite] delay-700" />
                  <span className="absolute top-[22%] left-[55%] w-14 sm:w-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[0.5px] animate-slipstream animate-[slipstream_1.3s_linear_infinite] delay-500" />
                </div>
                <Image
                  src="/images/footer-jet.png"
                  alt="M1 Supersonic Interceptor"
                  fill
                  sizes="(max-width: 768px) 340px, 640px"
                  className="object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]"
                />
                <FooterJetThrustFire />
              </div>
            </div>
          </div>

          {/* Right Supersonic Jet (Mirrored) */}
          <div className="absolute right-[-25px] sm:right-0 md:right-6 lg:right-12 top-[-10px] sm:top-2 w-[340px] sm:w-[460px] md:w-[560px] lg:w-[640px] h-[230px] sm:h-[310px] md:h-[380px] lg:h-[430px] z-10 group pointer-events-auto cursor-pointer">
            <div className="relative w-full h-full flex items-center justify-center scale-x-[-1] rotate-[12deg] transition-transform duration-500 ease-out group-hover:-translate-x-3 group-hover:-translate-y-3 group-hover:rotate-[14deg] animate-flight-bob-right animate-[flightBobRight_4.5s_ease-in-out_infinite]">
              <div className="relative w-full aspect-[1376/768]">
                <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
                  <span className="absolute top-[35%] left-[25%] w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent blur-[0.5px] animate-slipstream animate-[slipstream_1.4s_linear_infinite]" />
                  <span className="absolute top-[48%] left-[45%] w-24 sm:w-36 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent blur-[0.5px] animate-slipstream animate-[slipstream_1.1s_linear_infinite] delay-300" />
                  <span className="absolute top-[62%] left-[18%] w-20 sm:w-28 h-[1.5px] bg-gradient-to-r from-transparent via-sky-300/70 to-transparent blur-[0.5px] animate-slipstream animate-[slipstream_1.7s_linear_infinite] delay-700" />
                  <span className="absolute top-[22%] left-[55%] w-14 sm:w-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[0.5px] animate-slipstream animate-[slipstream_1.3s_linear_infinite] delay-500" />
                </div>
                <Image
                  src="/images/footer-jet.png"
                  alt="M1 Supersonic Fleet Interceptor"
                  fill
                  sizes="(max-width: 768px) 340px, 640px"
                  className="object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]"
                />
                <FooterJetThrustFire />
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 pt-36 sm:pt-44 md:pt-48">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
              {/* Col 1: Brand & Contact Info */}
              <div className="space-y-4">
                <Link href="/" className="flex items-center gap-3 group" aria-label="M1 Marketplace Home">
                  <Image
                    src="/m1-logo.png"
                    alt="M1 Marketplace Logo"
                    width={130}
                    height={45}
                    className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity object-contain"
                  />
                  <span className="text-white text-base sm:text-lg font-light tracking-widest uppercase text-zinc-300 group-hover:text-white transition-colors">
                    Marketplace
                  </span>
                </Link>

                <div className="pt-2 space-y-3 text-sm sm:text-base font-mono">
                  <div>
                    <a href="mailto:support@m-1.tech" className="text-zinc-200 hover:text-white transition-colors font-medium">
                      support@m-1.tech
                    </a>
                  </div>
                  <div className="text-zinc-300 pt-1 space-y-1">
                    <div className="text-xs text-zinc-400 uppercase tracking-widest font-sans font-medium">Corporate Comms</div>
                    <a href="tel:+14379945030" className="hover:text-white transition-colors block text-sm sm:text-base">
                      +1 (437) 994-5030
                    </a>
                  </div>
                  <div className="text-zinc-300 space-y-1">
                    <div className="text-xs text-zinc-400 uppercase tracking-widest font-sans font-medium">Global Network</div>
                    <a
                      href="https://rsinternational.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors block text-sm sm:text-base"
                    >
                      rsinternational.net ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Col 2: Resources */}
              <div className="space-y-4 font-mono">
                <h5 className="text-xs font-semibold text-white uppercase tracking-widest font-sans">
                  Resources
                </h5>
                <ul className="space-y-2.5 text-sm sm:text-base text-zinc-400">
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Market Reports — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Market Reports
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("FAQs — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      FAQs
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Documentation — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Blog — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Blog
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 3: Support */}
              <div className="space-y-4 font-mono">
                <h5 className="text-xs font-semibold text-white uppercase tracking-widest font-sans">
                  Support
                </h5>
                <ul className="space-y-2.5 text-sm sm:text-base text-zinc-400">
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Contact — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Live Chat — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Live Chat
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Help Center — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 4: Legal & Policies */}
              <div className="space-y-4 font-mono">
                <h5 className="text-xs font-semibold text-white uppercase tracking-widest font-sans">
                  Legal &amp; Policies
                </h5>
                <ul className="space-y-2.5 text-sm sm:text-base text-zinc-400">
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("SOPs — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Standard Operating Procedures (SOPs)
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Seller Policy — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Seller Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("User Policy — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      User Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Privacy Policy — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Terms of Service — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast("Compliance — coming soon."); }} className="hover:text-white transition-colors inline-block">
                      Compliance
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md rounded-2xl p-6 sm:p-10 mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
              <div>
                <h4 className="text-xl sm:text-2xl font-light text-white tracking-wide">
                  Join the exclusive circle
                </h4>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                  Curated listings, market intelligence, and off-market opportunities — delivered privately.
                </p>
              </div>
              <form className="flex flex-col sm:flex-row gap-3 w-full" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  disabled={newsletterStatus === "loading"}
                  className="flex-1 bg-zinc-900/90 border border-zinc-700/60 focus:border-white rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white transition-all font-mono disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === "loading"}
                  className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-widest px-7 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 duration-200 whitespace-nowrap cursor-pointer"
                >
                  {newsletterStatus === "loading" ? "Subscribing..." : newsletterStatus === "success" ? "Subscribed" : "Subscribe"}
                </button>
              </form>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mb-10">
              <a
                href="#"
                aria-label="LinkedIn"
                onClick={(e) => { e.preventDefault(); showToast("LinkedIn — coming soon."); }}
                className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-zinc-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.8c0-1.62-.03-3.7-2.25-3.7-2.26 0-2.6 1.77-2.6 3.6V23h-4V8z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="X (Twitter)"
                onClick={(e) => { e.preventDefault(); showToast("X — coming soon."); }}
                className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-zinc-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.9 2H22l-7.2 8.2L23 22h-6.6l-5.2-6.8L5.2 22H2l7.7-8.8L1.5 2h6.8l4.7 6.2L18.9 2z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                onClick={(e) => { e.preventDefault(); showToast("Facebook — coming soon."); }}
                className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-zinc-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 22v-8.5H16l.4-3.3h-2.9V8.2c0-1 .3-1.6 1.7-1.6H16V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.4H7v3.3h2.6V22h3.9z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                onClick={(e) => { e.preventDefault(); showToast("Instagram — coming soon."); }}
                className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-zinc-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="YouTube"
                onClick={(e) => { e.preventDefault(); showToast("YouTube — coming soon."); }}
                className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-zinc-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="5" width="20" height="14" rx="4" />
                  <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-zinc-400 font-mono">
              <div>© 2026 M1 Marketplace. All Rights Reserved.</div>
              <div className="flex items-center gap-6">
                <a href="#" onClick={(e) => { e.preventDefault(); showToast("Privacy Policy — coming soon."); }} className="hover:text-zinc-200 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); showToast("Terms — coming soon."); }} className="hover:text-zinc-200 transition-colors">
                  Terms
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); showToast("SOPs — coming soon."); }} className="hover:text-zinc-200 transition-colors">
                  SOPs
                </a>
              </div>
              <span className="text-zinc-500">Seller Console</span>
            </div>
          </div>
        </footer>
      </div>{/* end seller-scroll-body */}

      {/* ── Suspended Floating Bottom Navigation Bar (Seller Console) ── */}
      <header
        className={`fixed bottom-7 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none select-none transition-all duration-500 ease-out ${
          hiddenAtBottom ? "translate-y-28 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
      >
        <nav
          aria-label="Seller Actions Navigation"
          className="pointer-events-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-4 md:gap-5 px-5 sm:px-7 py-2 sm:py-2.5 rounded-full backdrop-blur-xl border border-white/20 hover:border-white/35 text-white transition-all max-w-5xl md:max-w-5xl lg:max-w-6xl w-full sm:w-auto overflow-x-auto no-scrollbar font-mono text-[11px] sm:text-xs uppercase tracking-wider shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.3)]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(10, 15, 25, 0.78) 50%, rgba(5, 8, 14, 0.92) 100%)",
          }}
        >
          {/* 1. Explore */}
          <button
            type="button"
            title="Explore"
            aria-label="Explore"
            onClick={() => {
              onClose();
              router.push("/listings");
            }}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold tracking-[0.14em] text-zinc-200 hover:text-white border border-transparent hover:border-white/25 hover:bg-white/10 transition-all duration-300 cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-500 group-hover:rotate-45"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.25" />
            </svg>
          </button>

          {/* 2. Intelligence - SI (Intelligence) */}
          <button
            type="button"
            title="SI (Intelligence)"
            aria-label="SI (Intelligence)"
            onClick={() => {
              showToast("SI (Intelligence) — autonomous operating intelligence.");
            }}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold tracking-[0.14em] text-zinc-200 hover:text-white border border-transparent hover:border-white/25 hover:bg-white/10 transition-all duration-300 cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M7 5H3" />
              <path d="M21 17v4" />
              <path d="M23 19h-4" />
            </svg>
          </button>

          {/* Left Divider */}
          <div className="h-4 w-[1px] bg-white/20 shrink-0" />

          {/* 3. Plus/add (+) Button - In the Center */}
          <button
            type="button"
            title="Publish New Asset"
            aria-label="Publish New Asset"
            onClick={() => setNewListingOpen(true)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/30 hover:border-white transition-all duration-200 cursor-pointer shadow-[0_0_14px_rgba(255,255,255,0.18)] hover:shadow-[0_0_20px_rgba(255,255,255,0.45)]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:rotate-90"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Right Divider */}
          <div className="h-4 w-[1px] bg-white/20 shrink-0" />

          {/* 4. Chat (Messages) Button */}
          <button
            type="button"
            title="Messages"
            aria-label="Messages"
            onClick={onToggleChat}
            className="group relative p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/15 border border-transparent hover:border-white/25 transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:scale-115"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          </button>

          {/* 5. Menu/Home Button */}
          <button
            type="button"
            title="Menu"
            aria-label="Extended Menu"
            onClick={() => togglePanel("menu")}
            className={`group p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/15 border transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer ${
              openPanel === "menu"
                ? "bg-white/20 text-white border-white/50 shadow-[0_0_14px_rgba(255,255,255,0.3)]"
                : "border-transparent hover:border-white/25"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:rotate-90"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>
      </header>

      {/* ── Overlay for drawers ── */}
      {openPanel && (
        <div
          className="overlay"
          onClick={() => setOpenPanel(null)}
          style={{ position: "fixed", inset: 0, zIndex: 810 }}
        />
      )}

      {/* ── Notifications Drawer ── */}
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

      {/* ── Profile Drawer ── */}
      {openPanel === "profile" && (
        <ProfilePanel
          onClose={() => setOpenPanel(null)}
          onOpenNotifications={() => togglePanel("notifications")}
        />
      )}

      {/* ── Extended Menu Drawer ── */}
      {openPanel === "menu" && (
        <div className="drawer show" style={{ zIndex: 820 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Menu</h3>
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
          <ul>
            <li className="menu-item" onClick={() => handleMenuItem("Saved Assets")}>Saved Assets</li>
            <li className="menu-item" onClick={() => handleMenuItem("Acquisition history")}>Acquisition history</li>
            <li className="menu-item" onClick={() => { setOpenPanel(null); onClose(); }}>Switch to buying mode</li>
            <li className="menu-item" onClick={() => handleMenuItem("M1 Ecosystem")}>M1 Ecosystem</li>
            <li className="menu-item" onClick={() => handleMenuItem("Report a problem")}>Report a problem</li>
            <li className="menu-item" onClick={() => handleMenuItem("Get support")}>Get support</li>
            <li className="menu-item" onClick={() => handleMenuItem("Join the exclusive circle")}>Join the exclusive circle</li>
          </ul>
        </div>
      )}

      <NewListingWizard
        open={newListingOpen}
        onClose={() => {
          setNewListingOpen(false);
          loadMyListings();
        }}
        showToast={showToast}
      />

      <SavedAssetsModal
        open={savedAssetsOpen}
        onClose={() => setSavedAssetsOpen(false)}
        onSelectAsset={onOpenAsset}
      />

      <EcosystemModal
        open={ecosystemOpen}
        onClose={() => setEcosystemOpen(false)}
      />
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}