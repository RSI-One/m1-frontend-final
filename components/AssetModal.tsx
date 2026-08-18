"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  jets,
  sfAdditional,
  sfAlternative,
  sfFeatured,
  getAssetOverview,
  getCategoryAccent,
} from "../lib/data";
import { Jet, SfItem } from "../lib/types";
import { useSite } from "../lib/site-context";

type Asset = Jet | SfItem;

interface AssetModalProps {
  asset: Asset | null;
  onClose: () => void;
}

type ViewKey = "exterior" | "cabin" | "blueprint";

function isSfItem(asset: Asset): asset is SfItem {
  return "year" in asset;
}

export default function AssetModal({ asset, onClose }: AssetModalProps) {
  const [activeView, setActiveView] = useState<ViewKey>("exterior");
  const [activeImage, setActiveImage] = useState(0);
  const { showToast } = useSite();

  const galleryAssets = useMemo(() => {
    if (!asset) return [];
    const allAssets: Asset[] = isSfItem(asset)
      ? [...sfFeatured, ...sfAlternative, ...sfAdditional]
      : jets;
    const selectedIndex = allAssets.findIndex((item) => item.name === asset.name);
    if (selectedIndex < 0) return [asset];
    return [
      ...allAssets.slice(selectedIndex),
      ...allAssets.slice(0, selectedIndex),
    ].slice(0, 4);
  }, [asset]);

  const exteriorImages = useMemo(
    () => galleryAssets.map((item) => item.image).filter(Boolean) as string[],
    [galleryAssets]
  );

  useEffect(() => {
    setActiveView("exterior");
    setActiveImage(0);
  }, [asset]);

  if (!asset) return null;

  const category = asset.cat;
  const overview = getAssetOverview(asset.name, category);
  const accent = getCategoryAccent(category);
  const realPrice = "price" in asset ? asset.price : undefined;
  const realDescription = "description" in asset ? asset.description : undefined;

  const nextImage = () => {
    setActiveImage((current) => (current === exteriorImages.length - 1 ? 0 : current + 1));
  };
  const previousImage = () => {
    setActiveImage((current) => (current === 0 ? exteriorImages.length - 1 : current - 1));
  };

  const handleGetThisPlane = () => {
    showToast(`Interest registered for ${overview.name}. Our team will reach out shortly.`);
    onClose();
  };
  


  const specChips: { label: string; value: string }[] = [
    { label: "Engine", value: overview.engine },
    { label: "Range", value: `${overview.range.toLocaleString()} NM` },
    { label: "Passenger Capacity", value: `${overview.passengers} pax` },
    { label: "Launch Year", value: String(overview.launchYear) },
    { label: "Last Unit Production", value: overview.lastProduction },
    { label: "Brand New Price Range", value: overview.brandNewPriceRange },
    { label: "Used Price Range", value: overview.usedPriceRange },
    { label: "Asking Price", value: realPrice || overview.avgMarketPrice },
    { label: "Variance", value: overview.variance },
  ];

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          className="modal-backdrop open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            className="asset-modal asset-modal-v3"
            style={{
              "--am-accent": accent.accent,
              "--am-accent-2": accent.accent2,
              "--am-accent-soft": accent.soft,
            } as CSSProperties}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="close-x"
              type="button"
              aria-label="Close asset details"
              onClick={onClose}
            >
              ✕
            </button>

            <div className="am3-grid">
              <div className="am3-left">
                <span className="modal-kicker">ASSET OVERVIEW</span>
                <h2>{overview.name}</h2>
                <p className="asset-subtitle">{category}</p>

                <div className="am3-chip-row">
                  {specChips.map((chip, i) => (
                    <motion.div
                      key={chip.label}
                      className="am3-chip"
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                    >
                      <span className="am3-chip-inner">
                        <small>{chip.label}</small>
                        <strong>{chip.value}</strong>
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="am3-cabin-options">
                  <small>Cabin Options</small>
                  <div className="am3-cabin-list">
                    {overview.cabinOptions.map((option) => (
                      <span key={option} className="am3-cabin-pill">{option}</span>
                    ))}
                  </div>
                </div>

                {realDescription && (
                  <div className="am3-cabin-options">
                    <small>Seller Notes</small>
                    <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.5, opacity: 0.9 }}>
                      {realDescription}
                    </p>
                  </div>
                )}

                <button type="button" className="btn-sharp btn-gold am3-cta" onClick={handleGetThisPlane}>
                  Get This Plane
                </button>
              </div>

              <div className="am3-right">
                <div className="am3-view-tabs">
                  <button
                    type="button"
                    className={activeView === "exterior" ? "am3-tab active" : "am3-tab"}
                    onClick={() => setActiveView("exterior")}
                  >
                    Exterior
                  </button>
                  <button
                    type="button"
                    className={activeView === "cabin" ? "am3-tab active" : "am3-tab"}
                    onClick={() => setActiveView("cabin")}
                  >
                    Cabin
                  </button>
                  <button
                    type="button"
                    className={activeView === "blueprint" ? "am3-tab active" : "am3-tab"}
                    onClick={() => setActiveView("blueprint")}
                  >
                    Blueprint
                  </button>
                </div>

                <div className="am3-viewer">
                  {activeView === "exterior" && (
                    <>
                      {exteriorImages.length ? (
                        <img
                          src={exteriorImages[activeImage]}
                          alt={overview.name}
                          className="am3-viewer-img"
                        />
                      ) : (
                        <div className="am3-placeholder">No image available</div>
                      )}
                      {exteriorImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="am3-arrow prev"
                            onClick={previousImage}
                            aria-label="Previous image"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            className="am3-arrow next"
                            onClick={nextImage}
                            aria-label="Next image"
                          >
                            ›
                          </button>
                          <div className="am3-dots">
                            {exteriorImages.map((image, index) => (
                              <button
                                key={`${image}-${index}`}
                                type="button"
                                aria-label={`Open image ${index + 1}`}
                                className={index === activeImage ? "carousel-dot active" : "carousel-dot"}
                                onClick={() => setActiveImage(index)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {activeView === "cabin" && (
                    <div className="am3-schematic">
                      <div className="am3-schematic-glow" />
                      <div className="am3-schematic-grid" />
                      <div className="am3-schematic-icon">
                        <svg width="150" height="72" viewBox="0 0 150 72" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="20" width="138" height="32" rx="16" />
                          <line x1="30" y1="20" x2="30" y2="52" />
                          <line x1="58" y1="20" x2="58" y2="52" />
                          <line x1="86" y1="20" x2="86" y2="52" />
                          <line x1="114" y1="20" x2="114" y2="52" />
                          <circle cx="18" cy="36" r="3.5" />
                          <circle cx="44" cy="36" r="3.5" />
                          <circle cx="72" cy="36" r="3.5" />
                          <circle cx="100" cy="36" r="3.5" />
                          <circle cx="128" cy="36" r="3.5" />
                        </svg>
                      </div>
                      <span className="am3-schematic-label">Cabin — Interior View</span>
                      <span className="am3-schematic-tag">Photography pending</span>
                    </div>
                  )}

                  {activeView === "blueprint" && (
                    <div className="am3-schematic">
                      <div className="am3-schematic-glow" />
                      <div className="am3-schematic-grid" />
                      <div className="am3-schematic-icon">
                        <svg width="170" height="80" viewBox="0 0 170 80" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 40 L48 22 L122 22 L162 40 L122 58 L48 58 Z" />
                          <line x1="48" y1="22" x2="48" y2="58" />
                          <line x1="70" y1="22" x2="70" y2="58" />
                          <line x1="92" y1="22" x2="92" y2="58" />
                          <line x1="114" y1="22" x2="114" y2="58" />
                          <path d="M85 4 L85 22 M85 58 L85 76" strokeDasharray="3 3" opacity="0.5" />
                        </svg>
                      </div>
                      <span className="am3-schematic-label">Cabin Blueprint</span>
                      <span className="am3-schematic-tag">Photography pending</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
