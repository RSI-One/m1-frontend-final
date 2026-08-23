"use client";

import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Wizard from "../components/Wizard";
import FeaturedSection from "../components/FeaturedSection";
import VerifiedSection from "../components/VerifiedSection";
import AllListings from "../components/AllListings";
import Footer from "../components/Footer";
import AssetModal from "../components/AssetModal";
import CompareModal from "../components/CompareModal";
import Toast from "../components/Toast";
import MessagingPage from "../components/MessagingPage";
import SellerMode from "../components/SellerMode";
import { SiteProvider, useSite } from "../lib/site-context";
import { Jet, SfItem } from "../lib/types";
import { jets } from "../lib/data";

export default function Page() {
  return (
    <SiteProvider>
      <PageInner />
    </SiteProvider>
  );
}

function PageInner() {
  const { showToast, showAllListings } = useSite();

  const [started, setStarted] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState<
    Jet | SfItem | null
  >(null);

  const [compareItems, setCompareItems] = useState<SfItem[]>([]);
  const [sellerModeOpen, setSellerModeOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);

  const openAssetFromSf = (item: SfItem) => {
    setSelectedAsset(item);
  };

  const openAssetFromJet = (jet: Jet) => {
    setSelectedAsset(jet);
  };

  const closeAssetModal = () => {
    setSelectedAsset(null);
  };

  const openCompareModal = (items: SfItem[]) => {
    setCompareItems(items);
  };

  const closeCompareModal = () => {
    setCompareItems([]);
  };

  return (
    <>
      <Header
        onToggleChat={() => setMessagingOpen(true)}
        onOpenSellerMode={() => setSellerModeOpen(true)}
      />

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

      {showAllListings ? (
        <AllListings onOpenAsset={openAssetFromSf} />
      ) : (
        <>
          <FeaturedSection onOpenAsset={openAssetFromJet} />
          <VerifiedSection onOpenAsset={openAssetFromJet} />
        </>
      )}

      <Footer />

      <AssetModal
        asset={selectedAsset}
        onClose={closeAssetModal}
      />

      <CompareModal
        items={compareItems}
        onClose={closeCompareModal}
      />

      <SellerMode
        open={sellerModeOpen}
        onClose={() => setSellerModeOpen(false)}
        jets={jets}
        onOpenAsset={openAssetFromJet}
        onToggleChat={() => setMessagingOpen(true)}
        showToast={showToast}
      />

      <Toast />

      <MessagingPage open={messagingOpen} onClose={() => setMessagingOpen(false)} />
    </>
  );
}