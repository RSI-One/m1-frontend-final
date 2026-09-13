"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import Hero from "../components/Hero";
import Wizard from "../components/Wizard";
import FeaturedSection from "../components/FeaturedSection";
import VerifiedSection from "../components/VerifiedSection";

export default function Page() {
  const [started, setStarted] = useState(false);

  return (
    <AppShell>
      {({ openAssetFromSf, openAssetFromJet, openCompareModal }) => (
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
        </>
      )}
    </AppShell>
  );
}