"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSite, BUDGET_MIN, BUDGET_MAX } from "../lib/site-context";

export default function ListingFiltersDrawer({
  zIndex = 9999,
}: {
  zIndex?: number;
}) {
  const {
    filterDrawerOpen,
    setFilterDrawerOpen,
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
  } = useSite();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!filterDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filterDrawerOpen, setFilterDrawerOpen]);

  if (!mounted || !filterDrawerOpen) return null;

  const clearFilters = () => {
    setMaxBudget(BUDGET_MAX);
    setSearch("");
    setJetType("");
    setMinPassengers(0);
    setMinRange(0);
    showToast("Filters reset");
  };

  const drawerContent = (
    <>
      {/* ── Overlay Backdrop ── */}
      <div
        className="overlay"
        onClick={() => setFilterDrawerOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: zIndex - 1,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* ── Filter Drawer (Left Side) ── */}
      <div
        className="drawer left show"
        style={{
          zIndex,
          position: "fixed",
          top: "76px",
          left: "28px",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Listing Filters"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>Listing Filters</h3>
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: 16,
              cursor: "pointer",
              padding: "2px 6px",
            }}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
        <p>Refine displayed fleet assets.</p>

        {/* Max Budget */}
        <div style={{ marginTop: 20 }}>
          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <span>Max Budget</span>
            <span style={{ color: "var(--gold-2)" }}>${maxBudget}M</span>
          </label>

          <input
            type="range"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={1}
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            style={{
              width: "100%",
              marginTop: 10,
              accentColor: "var(--gold)",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "var(--muted)",
              marginTop: 4,
            }}
          >
            <span>${BUDGET_MIN}M</span>
            <span>${BUDGET_MAX}M</span>
          </div>
        </div>

        {/* Jet Type */}
        <div
          className="mini"
          style={{
            borderTop: "none",
            paddingTop: 14,
            flexDirection: "column",
            gap: 10,
          }}
        >
          <label style={{ fontSize: 12, opacity: 0.8 }}>Jet Type</label>
          <select
            value={jetType}
            onChange={(e) => setJetType(e.target.value)}
            style={{ width: "100%", padding: "6px 8px" }}
          >
            <option value="">Any</option>
            <option value="LIGHT_JET">Light Jet</option>
            <option value="MID_SIZE_JET">Mid-Size Jet</option>
            <option value="SUPER_MID_JET">Super Mid Jet</option>
            <option value="HEAVY_JET">Heavy Jet</option>
            <option value="ULTRA_LONG_RANGE">Ultra Long Range</option>
            <option value="TURBOPROP">Turboprop</option>
            <option value="HELICOPTER">Helicopter</option>
            <option value="MARITIME_VESSEL">Maritime Vessel</option>
          </select>
        </div>

        {/* Min Passengers */}
        <div
          className="mini"
          style={{
            borderTop: "none",
            paddingTop: 4,
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div className="badge">Min Passengers: {minPassengers}</div>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={minPassengers}
            onChange={(e) => setMinPassengers(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* Min Range */}
        <div
          className="mini"
          style={{
            borderTop: "none",
            paddingTop: 4,
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div className="badge">Min Range: {minRange} NM</div>
          <input
            type="range"
            min={0}
            max={7000}
            step={100}
            value={minRange}
            onChange={(e) => setMinRange(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* Buttons */}
        <div className="btn-row" style={{ marginTop: 28 }}>
          <button className="btn-sharp" onClick={clearFilters}>
            Reset
          </button>
          <button
            className="btn-sharp btn-gold"
            onClick={() => {
              setFilterDrawerOpen(false);
              showToast("Filters applied.");
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}

