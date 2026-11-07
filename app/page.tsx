"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import Hero from "../components/Hero";
import Wizard from "../components/Wizard";
import FeaturedSection from "../components/FeaturedSection";
import VerifiedSection from "../components/VerifiedSection";
import ActiveListingsSection from "../components/ActiveListingsSection";
import TrendingSection from "../components/TrendingSection";
import { useSite } from "../lib/site-context";

export default function Page() {
  const [started, setStarted] = useState(false);
  const { showAllListings } = useSite();

  return (
    <AppShell>
      {({ openAssetFromSf, openAssetFromJet, openCompareModal, openNewListing, refreshKey }) => (
        <>
          <section className="engine-section" id="workspace">
            <div className="engine-shell">
              {!started ? (
                <Hero onStart={() => setStarted(true)} />
              ) : (
                <Wizard
                  onBack={() => setStarted(false)}
                  onOpenAsset={openAssetFromSf}
                  onOpenCompare={openCompareModal}
                />
              )}
            </div>
          </section>

          <FeaturedSection onOpenAsset={openAssetFromJet} />
          <VerifiedSection onOpenAsset={openAssetFromJet} />

          {showAllListings && (
            <>
              <ActiveListingsSection
                onOpenAsset={openAssetFromJet}
                onOpenNewListing={openNewListing}
                refreshTrigger={refreshKey}
              />
              <TrendingSection onOpenAsset={openAssetFromJet} />
            </>
          )}
        </>
      )}
    </AppShell>
  );
}