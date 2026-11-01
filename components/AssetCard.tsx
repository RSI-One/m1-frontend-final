"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AssetCardProps {
  name: string;
  price?: string;
  cat: string;
  loc?: string;
  year?: number;
  image?: string;
  ribbon?: "featured" | "verified" | "off-market" | string;
  ribbonText?: string;
  badge?: string;
  discount?: string;
  timeRemaining?: string;
  suggestion?: boolean;
  small?: boolean;
  selected?: boolean;
  /** Minimal mode: image + full name only, no ribbon/price/meta. */
  minimal?: boolean;
  /** Force the corner ribbon to show even in minimal mode. */
  showRibbon?: boolean;
  colorTheme?: "coral" | "pink" | "purple" | "teal" | "caramel";
  onClick?: () => void;
}

export default function AssetCard({
  name,
  price,
  cat,
  loc,
  year,
  image,
  ribbon,
  ribbonText,
  badge,
  discount,
  timeRemaining,
  suggestion = false,
  small = false,
  selected = false,
  minimal = false,
  showRibbon = false,
  onClick,
}: AssetCardProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [image]);

  const shouldShowRibbon = Boolean((ribbon || badge) && (showRibbon || !minimal));
  const activeRibbon = ribbon || (badge ? "off-market" : undefined);

  return (
    <motion.div
      className={`asset-card ${small ? "sf-card" : ""} ${suggestion ? "suggestion" : ""} ${selected ? "compare-selected" : ""} ${minimal ? "minimal-card" : ""}`}
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      {!minimal && suggestion && <div className="m1-tag">M1 Suggestion</div>}
      {shouldShowRibbon && activeRibbon && (
        <div className={`corner-ribbon ${activeRibbon}`}>
          <span>
            {ribbonText ||
              (activeRibbon === "featured"
                ? "Featured"
                : activeRibbon === "verified"
                ? "Verified"
                : activeRibbon === "off-market"
                ? "Off-Market"
                : activeRibbon)}
          </span>
        </div>
      )}
      <div className="main-img" style={{ position: "absolute", inset: 0 }}>
        {image && !imgError ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #1f232b 0%, #12141a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                color: "rgba(212, 175, 120, 0.7)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textAlign: "center",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {name}
            </span>
          </div>
        )}
      </div>
      <div className="card-overlay">
        {!minimal && (price || discount) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 9 }}>
            {price && <div className="price-badge" style={{ marginBottom: 0 }}>{price}</div>}
            {discount && (
              <span
                style={{
                  background: "rgba(220, 38, 38, 0.88)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {discount}
              </span>
            )}
          </div>
        )}
        <div className="name">{name}</div>
        {!minimal && (
          <div className="mini-detail">
            <span>
              {cat}
              {year ? ` · ${year}` : ""}
              {timeRemaining ? ` · ${timeRemaining}` : ""}
            </span>
            {loc && (
              <span className="loc">
                <span className="loc-dot" />
                {loc}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
