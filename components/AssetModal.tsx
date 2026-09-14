"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  jets,
  sfAdditional,
  sfAlternative,
  sfFeatured,
  sfSpecsFor,
} from "../lib/data";
import { Jet, SfItem } from "../lib/types";
import { useSite } from "../lib/site-context";

type Asset = Jet | SfItem;

interface AssetModalProps {
  asset: Asset | null;
  onClose: () => void;
}

type TabKey = "details" | "documents";

function isSfItem(asset: Asset): asset is SfItem {
  return "year" in asset;
}

function getMakeAndModel(fullName: string): { make: string; model: string } {
  const knownMakers = [
    "HondaJet",
    "Adam Aircraft",
    "Gulfstream",
    "Bombardier",
    "Dassault",
    "Cessna",
    "Embraer",
    "Pilatus",
    "Beechcraft",
    "Boeing",
    "Airbus",
    "AgustaWestland",
    "Sikorsky",
    "Azimut",
    "Sunseeker",
    "Benetti",
    "Riva",
    "Feadship",
  ];
  for (const m of knownMakers) {
    if (fullName.toLowerCase().startsWith(m.toLowerCase())) {
      return { make: m, model: fullName };
    }
  }
  const parts = fullName.split(" ");
  return {
    make: parts[0] || "Aircraft",
    model: fullName,
  };
}

interface PhotoItem {
  url: string;
  label: string;
}

interface DocGroup {
  title: string;
  items: { name: string; verified: boolean }[];
}

const defaultDocumentGroups: DocGroup[] = [
  {
    title: "Airworthiness & Registration",
    items: [
      { name: "Certificate of Airworthiness (Standard)", verified: true },
      { name: "FAA / EASA Registration Certificate", verified: true },
      { name: "Radio Station License", verified: true },
    ],
  },
  {
    title: "Maintenance & Inspection Records",
    items: [
      { name: "Airframe Logbooks (Complete from New)", verified: true },
      { name: "Engine 1 & 2 Logbooks (Factory Spec)", verified: true },
      { name: "Avionics Maintenance Records & STCs", verified: true },
      { name: "Phase / Letter Inspection Sign-off", verified: false },
    ],
  },
  {
    title: "Ownership & Pre-Purchase Documentation",
    items: [
      { name: "Title Search & Lien-Free Release Letter", verified: true },
      { name: "Aircraft Specification Sheet (Official)", verified: true },
      { name: "Pre-Purchase Inspection (PPI) Scope", verified: false },
    ],
  },
];

export default function AssetModal({ asset, onClose }: AssetModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
  });
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

  const exteriorImages = useMemo(() => {
    if (!asset) return [];
    if ("images" in asset && Array.isArray(asset.images) && asset.images.length > 0) {
      return asset.images.filter(Boolean);
    }
    if (asset.image && typeof asset.image === "string" && asset.image.trim()) {
      return [asset.image];
    }
    return galleryAssets.map((item) => item.image).filter(Boolean) as string[];
  }, [asset, galleryAssets]);

  const cabinImages = useMemo(() => {
    if (!asset) return [];
    if ("cabinImages" in asset && Array.isArray(asset.cabinImages) && asset.cabinImages.length > 0) {
      return asset.cabinImages.filter(Boolean);
    }
    return [];
  }, [asset]);

  const blueprintImages = useMemo(() => {
    if (!asset) return [];
    if ("blueprintImages" in asset && Array.isArray(asset.blueprintImages) && asset.blueprintImages.length > 0) {
      return asset.blueprintImages.filter(Boolean);
    }
    return [];
  }, [asset]);

  const photos = useMemo<PhotoItem[]>(() => {
    const list: PhotoItem[] = [];
    exteriorImages.forEach((url) => list.push({ url, label: "Exterior" }));
    cabinImages.forEach((url) => list.push({ url, label: "Cabin" }));
    blueprintImages.forEach((url) => list.push({ url, label: "Blueprint" }));
    if (list.length === 0 && asset?.image) {
      list.push({ url: asset.image, label: "Exterior" });
    }
    return list;
  }, [exteriorImages, cabinImages, blueprintImages, asset]);

  const specs = useMemo(() => {
    if (!asset) return null;
    return sfSpecsFor({
      name: asset.name,
      cat: asset.cat || "Light Jet",
      year: isSfItem(asset) ? asset.year : 2023,
    });
  }, [asset]);

  useEffect(() => {
    setActiveTab("details");
    setActiveImage(0);
    setIsSaved(false);
  }, [asset]);

  if (!asset) return null;

  const { make, model } = getMakeAndModel(asset.name);
  const variant = asset.cat || "Aircraft";
  const year = isSfItem(asset) ? asset.year : specs?.year || 2023;

  const isVerified = Boolean(
    ("verified" in asset && asset.verified) ||
      ("is_verified" in asset && (asset as unknown as { is_verified: boolean }).is_verified) ||
      ("verification_status" in asset &&
        ((asset as unknown as { verification_status: string }).verification_status === "verified" ||
          (asset as unknown as { verification_status: string }).verification_status === "approved"))
  );

  const isFeatured = Boolean(
    ("featured" in asset && asset.featured) ||
      ("is_featured" in asset && (asset as unknown as { is_featured: boolean }).is_featured) ||
      ("featured_status" in asset && (asset as unknown as { featured_status: boolean }).featured_status)
  );

  const priceDisplay =
    ("price" in asset && asset.price && asset.price !== "$0.0M")
      ? asset.price
      : specs?.price || "Price on request";

  const descriptionText =
    ("description" in asset && asset.description)
      ? asset.description
      : `Exceptional ${variant.toLowerCase()} in carefully maintained condition. This aircraft combines outstanding performance, comfort and a refined cabin experience.`;

  const nextPhoto = () => {
    if (!photos.length) return;
    setActiveImage((curr) => (curr === photos.length - 1 ? 0 : curr + 1));
  };

  const prevPhoto = () => {
    if (!photos.length) return;
    setActiveImage((curr) => (curr === 0 ? photos.length - 1 : curr - 1));
  };

  const toggleGroup = (idx: number) => {
    setOpenGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const activePhoto = photos[activeImage] || photos[0];

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          className="modal-backdrop open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="asset-modal-v2"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Hero Image Section */}
            <div className="asset-modal-hero">
              {activePhoto?.url ? (
                <img
                  src={activePhoto.url}
                  alt={asset.name}
                  className="asset-modal-image"
                />
              ) : (
                <div className="asset-modal-image-placeholder">No image available</div>
              )}

              {/* Status Badges */}
              <div className="asset-modal-badges">
                {isVerified && <span className="asset-modal-pill verified">✓ VERIFIED</span>}
                {isFeatured && <span className="asset-modal-pill featured">★ FEATURED</span>}
              </div>

              {/* Close Button */}
              <button
                className="close-x"
                type="button"
                aria-label="Close asset details"
                onClick={onClose}
              >
                ✕
              </button>

              {/* Photo Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    className="asset-modal-arrow previous"
                    type="button"
                    aria-label="Previous photo"
                    onClick={prevPhoto}
                  >
                    ‹
                  </button>
                  <button
                    className="asset-modal-arrow next"
                    type="button"
                    aria-label="Next photo"
                    onClick={nextPhoto}
                  >
                    ›
                  </button>

                  <div className="asset-modal-carousel">
                    {photos.map((p, i) => (
                      <button
                        key={p.url + i}
                        type="button"
                        className={`carousel-dot ${i === activeImage ? "active" : ""}`}
                        onClick={() => setActiveImage(i)}
                        title={`${p.label} (${i + 1}/${photos.length})`}
                        aria-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Photo View Label Indicator */}
              {photos.length > 1 && activePhoto?.label && (
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 60,
                    zIndex: 4,
                    background: "rgba(0, 0, 0, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--gold-bright)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {activePhoto.label} ({activeImage + 1}/{photos.length})
                </div>
              )}

              {/* Asking Price & Availability */}
              <div className="asset-modal-price">
                <span>ASKING PRICE</span>
                <strong>{priceDisplay}</strong>
                <em>AVAILABLE</em>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="asset-modal-tabs">
              <button
                type="button"
                className={`asset-modal-tab ${activeTab === "details" ? "active" : ""}`}
                onClick={() => setActiveTab("details")}
              >
                ASSET DETAILS
              </button>
              <button
                type="button"
                className={`asset-modal-tab ${activeTab === "documents" ? "active" : ""}`}
                onClick={() => setActiveTab("documents")}
              >
                DOCUMENTS
              </button>
            </div>

            {/* Main Content Area */}
            <div className="asset-modal-content">
              {activeTab === "details" ? (
                <div className="details-panel">
                  {/* Left Column: Asset Specs */}
                  <div className="details-column">
                    <span className="modal-kicker">ASSET DETAILS</span>
                    <h2>{model}</h2>
                    <p className="asset-subtitle">{variant} - {year}</p>

                    <div className="modal-spec-grid">
                      <div>
                        <small>MAKE</small>
                        <strong>{make}</strong>
                      </div>
                      <div>
                        <small>MODEL</small>
                        <strong>{model}</strong>
                      </div>
                      <div>
                        <small>VARIANT</small>
                        <strong>{variant}</strong>
                      </div>
                      <div>
                        <small>YEAR</small>
                        <strong>{year}</strong>
                      </div>
                      <div>
                        <small>ENGINE</small>
                        <strong>{specs?.engine || "Williams International FJ44"}</strong>
                      </div>
                      <div>
                        <small>SEATS</small>
                        <strong>{specs?.passengers || 6} pax</strong>
                      </div>
                      <div>
                        <small>RANGE</small>
                        <strong>{(specs?.range || 2128).toLocaleString()} NM</strong>
                      </div>
                      <div>
                        <small>CRUISE</small>
                        <strong>{specs?.cruise || 429} kt</strong>
                      </div>
                    </div>

                    <div className="asset-detail-badges">
                      {isVerified && <span>✓ VERIFIED</span>}
                      <span>{variant.toUpperCase()}</span>
                    </div>

                    <div className="health-row">
                      <div>
                        <small>TOTAL FLIGHT HOURS</small>
                        <strong>{specs?.hours || 300} hrs</strong>
                      </div>
                      <div>
                        <div className="health-score">
                          <b>{specs?.health || 98}</b>
                          <span>
                            HEALTH SCORE
                            <strong>Excellent</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Description, Reason & Cabin Dimensions */}
                  <div className="details-column">
                    <span className="modal-kicker">DESCRIPTION</span>
                    <p className="asset-description">{descriptionText}</p>

                    <div className="reason-box">
                      <small>REASON FOR SELLING</small>
                      <em>Owner upgrading to larger platform</em>
                    </div>

                    <div className="mini-spec-grid">
                      <div>
                        <small>CABIN LENGTH</small>
                        <strong>{specs?.cabin || 18} ft</strong>
                      </div>
                      <div>
                        <small>CABIN HEIGHT</small>
                        <strong>4.8 ft</strong>
                      </div>
                      <div>
                        <small>MAX ALTITUDE</small>
                        <strong>FL{specs?.maxAlt || 450}</strong>
                      </div>
                      <div>
                        <small>LOCATION</small>
                        <strong>{asset.loc || "Worldwide"}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="documents-panel-v2">
                  {defaultDocumentGroups.map((group, gIdx) => (
                    <div key={group.title} className="document-group">
                      <button
                        type="button"
                        className="document-heading"
                        onClick={() => toggleGroup(gIdx)}
                      >
                        <span>{group.title}</span>
                        <b>{openGroups[gIdx] ? "−" : "+"}</b>
                      </button>
                      {openGroups[gIdx] && (
                        <div className="document-list">
                          {group.items.map((doc) => (
                            <div
                              key={doc.name}
                              className={`document-row ${doc.verified ? "verified" : "pending"}`}
                            >
                              <span>{doc.name}</span>
                              {doc.verified ? <b>✓ Verified</b> : <i>● Pending Review</i>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="asset-modal-actions">
              <button
                type="button"
                className={`save-button ${isSaved ? "saved" : ""}`}
                onClick={() => {
                  const nextSaved = !isSaved;
                  setIsSaved(nextSaved);
                  showToast(nextSaved ? `Saved ${model} to your fleet.` : `Removed ${model} from saved.`);
                }}
              >
                <span>{isSaved ? "♥" : "♡"}</span> {isSaved ? "Saved" : "Save"}
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast(`Opening private communication channel for ${model}…`);
                  onClose();
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Chat
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast(`Meeting requested for ${model}. Our advisory desk will schedule the conference.`);
                }}
              >
                Organize Meeting
              </button>

              <button
                type="button"
                className="start-acquisition-button"
                onClick={() => {
                  showToast(`Acquisition process initiated for ${model}.`);
                  onClose();
                }}
              >
                Start Acquisition →
              </button>

              <button
                type="button"
                className="report-button"
                onClick={() => {
                  showToast("Listing flagged for compliance review.");
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                Report
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}