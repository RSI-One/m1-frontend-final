"use client";

import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import FeaturedSection from "../../components/FeaturedSection";
import VerifiedSection from "../../components/VerifiedSection";
import ActiveListingsSection from "../../components/ActiveListingsSection";
import TrendingSection from "../../components/TrendingSection";

export default function ListingsPage() {
  const router = useRouter();

  return (
    <AppShell>
      {({ openAssetFromJet, openNewListing, refreshKey }) => (
        <>
          {/* Back button aligned to the left corner of the page */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              padding: "20px clamp(20px, 4vw, 64px) 8px",
              maxWidth: 1380,
              margin: "0 auto",
              width: "100%",
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="all-listings-view-all"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                borderRadius: "8px",
                color: "#e6e9ee",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
                transition: "all .18s ease",
              }}
            >
              ← Back
            </button>
          </div>

          {/* All 4 rows: Featured, Verified, Your Active Listings, and Trending */}
          <FeaturedSection onOpenAsset={openAssetFromJet} showAll />
          <VerifiedSection onOpenAsset={openAssetFromJet} />
          <ActiveListingsSection
            onOpenAsset={openAssetFromJet}
            onOpenNewListing={openNewListing}
            refreshTrigger={refreshKey}
          />
          <TrendingSection onOpenAsset={openAssetFromJet} />
        </>
      )}
    </AppShell>
  );
}
