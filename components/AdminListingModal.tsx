"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { getCategoryAccent } from "../lib/data";

// ---------------------------------------------------------------------------
// Shape returned by GET /admin/listings/active (and, once extended, the
// row-detail lookup). See app/services/listing_service.py :: _listing_to_cache_dict
// ---------------------------------------------------------------------------
export interface AdminListingDetail {
  id: string;
  asset_id: string;
  listing_code: string | null;
  status: string;
  listing_type: string;
  price: number | null;
  flag_color: string | null;
  is_verified: boolean;
  is_featured: boolean;
  view_count: number;
  click_count: number;
  saves_count?: number;
  created_at: string | null;

  // Owner / seller — added for admin view
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  seller_location: string | null; // shown in preview card too
  asset_location: string | null; // in-depth view only, per CEO clarification

  // Asset overview — same fields AssetModal already renders
  name: string;
  cat: string;
  engine?: string;
  range?: number;
  passengers?: number;
  launchYear?: number;
  image?: string;
}

interface AdminListingModalProps {
  listing: AdminListingDetail | null;
  onClose: () => void;
  onDelist?: (listingId: string) => void;
}

export default function AdminListingModal({ listing, onClose, onDelist }: AdminListingModalProps) {
  const accent = useMemo(
    () => (listing ? getCategoryAccent(listing.cat) : { accent: "#F5C542", accent2: "#F5C542", soft: "rgba(245,197,66,0.1)" }),
    [listing]
  );

  if (!listing) return null;

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  const formatPrice = (p: number | null) => (p == null ? "—" : `$${p.toLocaleString()}`);

  // Same chip pattern AssetModal uses for the public overview
  const specChips: { label: string; value: string }[] = [
    { label: "Engine", value: listing.engine ?? "—" },
    { label: "Range", value: listing.range ? `${listing.range.toLocaleString()} NM` : "—" },
    { label: "Passenger Capacity", value: listing.passengers ? `${listing.passengers} pax` : "—" },
    { label: "Launch Year", value: listing.launchYear ? String(listing.launchYear) : "—" },
  ];

  // New — admin-only fields per boss's instruction (seller info + analytics + date)
  const sellerFields: { label: string; value: string }[] = [
    { label: "Owner", value: listing.owner_name ?? "—" },
    { label: "Phone", value: listing.owner_phone ?? "—" },
    { label: "Email", value: listing.owner_email ?? "—" },
    { label: "Seller Location", value: listing.seller_location ?? "—" },
    { label: "Asset Location", value: listing.asset_location ?? "—" },
  ];

  const analyticsFields: { label: string; value: string }[] = [
    { label: "Views", value: String(listing.view_count) },
    { label: "Clicks", value: String(listing.click_count) },
    { label: "Saves", value: String(listing.saves_count ?? 0) },
    { label: "Listed On", value: formatDate(listing.created_at) },
    { label: "Listing Code", value: listing.listing_code ?? "—" },
  ];

  const canDelist = ["published", "verified", "featured"].includes(listing.status);

  return (
    <AnimatePresence>
      {listing && (
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
            <button className="close-x" type="button" aria-label="Close listing details" onClick={onClose}>
              ✕
            </button>

            <div className="am3-grid">
              {/* ---- Left: same basic body as the public AssetModal ---- */}
              <div className="am3-left">
                <span className="modal-kicker">ADMIN — LISTING OVERVIEW</span>
                <h2>{listing.name}</h2>
                <p className="asset-subtitle">{listing.cat}</p>

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
                  <motion.div
                    className="am3-chip"
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: specChips.length * 0.05 }}
                  >
                    <span className="am3-chip-inner">
                      <small>Price</small>
                      <strong>{formatPrice(listing.price)}</strong>
                    </span>
                  </motion.div>
                </div>

                {/* ---- New: seller / owner info ---- */}
                <div className="am3-cabin-options">
                  <small>Seller Information</small>
                  <div className="am-admin-field-grid">
                    {sellerFields.map((f) => (
                      <div key={f.label} className="am-admin-field">
                        <span className="am-admin-field-label">{f.label}</span>
                        <span className="am-admin-field-value">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ---- New: admin analytics + listing date ---- */}
                <div className="am3-cabin-options">
                  <small>Admin Analytics</small>
                  <div className="am-admin-field-grid">
                    {analyticsFields.map((f) => (
                      <div key={f.label} className="am-admin-field">
                        <span className="am-admin-field-label">{f.label}</span>
                        <span className="am-admin-field-value">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="am-admin-actions">
                  <span
                    className="am-admin-status-pill"
                    style={{
                      background: listing.is_featured ? "rgba(245,197,66,0.15)" : listing.is_verified ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.08)",
                      color: listing.is_featured ? "#F5C542" : listing.is_verified ? "#4ADE80" : "#ccc",
                    }}
                  >
                    {listing.status.toUpperCase()}
                  </span>

                  {canDelist && onDelist && (
                    <button
                      type="button"
                      className="btn-sharp am-admin-delist-btn"
                      onClick={() => {
                        onDelist(listing.id);
                        onClose();
                      }}
                    >
                      Delist Listing
                    </button>
                  )}
                </div>
              </div>

              {/* ---- Right: same image viewer shell as AssetModal ---- */}
              <div className="am3-right">
                <div className="am3-viewer">
                  {listing.image ? (
                    <img src={listing.image} alt={listing.name} className="am3-viewer-img" />
                  ) : (
                    <div className="am3-placeholder">No image available</div>
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

/*
  Scoped additions — append to the shared stylesheet (does not touch any
  existing .am3-* rules from AssetModal.tsx):

  .am-admin-field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
    margin-top: 8px;
  }
  .am-admin-field { display: flex; flex-direction: column; gap: 2px; }
  .am-admin-field-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(245,245,220,0.4);
  }
  .am-admin-field-value { font-size: 13px; color: #F5F5DC; }
  .am-admin-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
  }
  .am-admin-status-pill {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 4px;
  }
  .am-admin-delist-btn {
    background: rgba(255,92,92,0.12);
    color: #FF8080;
    border: 1px solid rgba(255,92,92,0.3);
  }
*/
