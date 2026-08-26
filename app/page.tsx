"use client";

import { useState, useEffect } from "react";
import AuthScreen from "../components/auth/AuthScreen";
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
import * as authApi from "../lib/api/auth";

export default function Page() {
  return (
    <SiteProvider>
      <PageInner />
    </SiteProvider>
  );
}

function PageInner() {
  const { showToast, showAllListings } = useSite();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // While we're checking for an existing session, we don't want to flash
  // the login screen before we know the answer.
  const [checkingSession, setCheckingSession] = useState(true);

  // On first mount, silently ask the backend if we already have a valid
  // session. getMe() goes through client.ts's apiRequest, which already
  // handles 401 -> silent /auth/refresh -> retry automatically. This is
  // what replaces "log in every time" with "log in once, stay logged in".
  useEffect(() => {
    authApi
      .getMe()
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, []);

  // Marketplace state
  const [started, setStarted] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState<Jet | SfItem | null>(null);

  const [compareItems, setCompareItems] = useState<SfItem[]>([]);
  const [sellerModeOpen, setSellerModeOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);

  // Called after successful login/register
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

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

  // While we're still checking for a valid session, show a lightweight
  // loading state instead of flashing the login screen.
  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b0d]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  // Show authentication screen only if the silent session check failed
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Existing marketplace
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

      <MessagingPage
        open={messagingOpen}
        onClose={() => setMessagingOpen(false)}
      />
    </>
  );
}