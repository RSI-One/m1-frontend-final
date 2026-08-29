"use client";

import { motion } from "framer-motion";

interface AssetCardProps {
  name: string;
  price?: string;
  cat: string;
  loc?: string;
  year?: number;
  image?: string;
  ribbon?: "featured" | "verified" | "off-market";
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
  ribbon = "featured",
  suggestion = false,
  small = false,
  selected = false,
  minimal = false,
  showRibbon = false,
  onClick,
}: AssetCardProps) {
  return (
    <motion.div
      className={`asset-card ${small ? "sf-card" : ""} ${suggestion ? "suggestion" : ""} ${selected ? "compare-selected" : ""} ${minimal ? "minimal-card" : ""}`}
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      {!minimal && suggestion && <div className="m1-tag">M1 Suggestion</div>}
      {(!minimal || showRibbon) && (
        <div className={`corner-ribbon ${ribbon}`}>
          <span>{ribbon === "featured" ? "Featured" : "Verified"}</span>
        </div>
      )}
      <div className="main-img" style={{ position: "absolute", inset: 0 }}>
        {image ? (
          <img
            src={image}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, #2a2d36, #14161c 70%)",
          }} />
        )}
      </div>
      {!minimal && price && <div className="price-badge">{price}</div>}
      <div className="card-overlay">
        <div className="name">{name}</div>
        {!minimal && (
          <div className="mini-detail">
            <span>{cat}{year ? ` · ${year}` : ""}</span>
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
