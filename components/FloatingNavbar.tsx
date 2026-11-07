"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSite, BUDGET_MIN, BUDGET_MAX } from "../lib/site-context";
import { api } from "../lib/api";
import IntelligenceModal from "./IntelligenceModal";

type PanelKey = "filter" | "menu" | null;

const menuItems = [
  "Your Active Listings",
  "Publish New Asset",
  "Saved Assets",
  "Acquisition history",
  "M1 Ecosystem",
  "Report a problem",
  "Get support",
  "Join the exclusive circle",
];

type FloatingNavbarProps = {
  onToggleChat: () => void;
  onOpenNewListing?: () => void;
  onOpenSellerMode?: () => void;
  onOpenReportProblem?: () => void;
  onOpenGetSupport?: () => void;
  onOpenAcquisitionHistory?: () => void;
};

export default function FloatingNavbar({
  onToggleChat,
  onOpenNewListing,
  onOpenSellerMode,
  onOpenReportProblem,
  onOpenGetSupport,
  onOpenAcquisitionHistory,
}: FloatingNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const [hiddenAtBottom, setHiddenAtBottom] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);

  const {
    maxBudget,
    setMaxBudget,
    jetType,
    setJetType,
    minPassengers,
    setMinPassengers,
    minRange,
    setMinRange,
    setSearch,
    showToast,
    refreshUser,
    unreadCount,
  } = useSite();

  // Hide suspended bar when user hits the very bottom edge (near footer copyright)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );

      if (scrollY + viewportHeight >= docHeight - 80) {
        setHiddenAtBottom(true);
      } else {
        setHiddenAtBottom(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape key to close drawers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenPanel(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const togglePanel = (key: PanelKey) => {
    setOpenPanel((cur) => (cur === key ? null : key));
  };

  const handleMenuItem = (label: string) => {
    if (label === "Publish New Asset") {
      setOpenPanel(null);
      onOpenNewListing?.();
      return;
    }

    if (label === "Your Active Listings") {
      setOpenPanel(null);
      const el = document.getElementById("active-listings");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (label === "Report a problem") {
      setOpenPanel(null);
      onOpenReportProblem?.();
      return;
    }

    if (label === "Acquisition history") {
      setOpenPanel(null);
      onOpenAcquisitionHistory?.();
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
    setJetType("");
    setMinPassengers(0);
    setMinRange(0);
    showToast("Filters reset");
  };

  const isFilterActive =
    maxBudget < BUDGET_MAX ||
    Boolean(jetType) ||
    minPassengers > 0 ||
    minRange > 0;

  return (
    <>
      {/* ── Suspended Floating Bottom Navigation Bar (Matching Reference Website) ── */}
      <header
        className={`fixed bottom-7 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none select-none transition-all duration-500 ease-out ${
          hiddenAtBottom ? "translate-y-28 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
      >
        <nav
          aria-label="Floating Actions Navigation"
          className="pointer-events-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-4 md:gap-5 px-5 sm:px-7 py-2 sm:py-2.5 rounded-full backdrop-blur-xl border border-white/20 hover:border-white/35 text-white transition-all max-w-5xl md:max-w-5xl lg:max-w-6xl w-full sm:w-auto overflow-x-auto no-scrollbar font-mono text-[11px] sm:text-xs uppercase tracking-wider shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.3)]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(10, 15, 25, 0.78) 50%, rgba(5, 8, 14, 0.92) 100%)",
          }}
        >
          {/* 2. Explore Button (Replaced All Listings) */}
          <button
            type="button"
            onClick={() => router.push("/listings")}
            className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold tracking-[0.14em] transition-all duration-300 cursor-pointer ${
              pathname === "/listings"
                ? "text-white bg-white/20 border border-white/60 shadow-[0_0_16px_rgba(255,255,255,0.38)]"
                : "text-zinc-200 hover:text-white border border-transparent hover:border-white/25 hover:bg-white/10"
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
              className="transition-transform duration-500 group-hover:rotate-45"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.25" />
            </svg>
            {/* <span>Explore</span> */}
          </button>

          {/* 3. Intelligence Button - SI (Intelligence) */}

          <button
            type="button"
            title="SI (Intelligence)"
            aria-label="SI (Intelligence)"
            onClick={() => setIntelligenceOpen(true)}
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
            {/* <span>SI</span> */}
          </button>

          {/* Left Divider */}
          <div className="h-4 w-[1px] bg-white/20 shrink-0" />

          {/* 3. Plus/add (+) Button - In the Center */}
          <button
            type="button"
            title="Publish New Asset"
            aria-label="Publish New Asset"
            onClick={onOpenNewListing}
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

          {/* 4. Messages Button */}
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
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d6ad5c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d6ad5c] shadow-[0_0_8px_rgba(214,173,92,0.9)]"></span>
              </span>
            )}
          </button>

          {/* 5. Hamburger Menu Button */}
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

      <IntelligenceModal
        open={intelligenceOpen}
        onClose={() => setIntelligenceOpen(false)}
      />

      {/* ── Overlay Backdrop ── */}
      {openPanel && (
        <div
          className="overlay"
          onClick={() => setOpenPanel(null)}
          style={{ position: "fixed", inset: 0, zIndex: 190 }}
        />
      )}

      {/* ── Extended Menu Drawer (Right Side) ── */}
      {openPanel === "menu" && (
        <div className="drawer show" style={{ zIndex: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Marketplace Index</h3>
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
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <p>Global aircraft and private yacht transactions.</p>
          <ul>
            {menuItems.map((item) => (
              <li
                key={item}
                className="menu-item"
                onClick={() => handleMenuItem(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
