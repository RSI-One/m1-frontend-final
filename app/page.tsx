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
import SupportModals from "../components/SupportModals";
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
  const [checkingSession, setCheckingSession] = useState(true);

  // Support / Report a Problem state (single source of truth)
  const [supportModalType, setSupportModalType] = useState<
    "report" | "support" | null
  >(null);

  // Marketplace state
  const [started, setStarted] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Jet | SfItem | null>(
    null
  );
  const [compareItems, setCompareItems] = useState<SfItem[]>([]);
  const [sellerModeOpen, setSellerModeOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);

  // Check authentication session
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

  // Loading screen
  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b0d]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  // Authentication screen
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      {/* HEADER */}
      <Header
        onToggleChat={() => setMessagingOpen(true)}
        onOpenSellerMode={() => setSellerModeOpen(true)}
        onOpenReportProblem={() => setSupportModalType("report")}
        onOpenGetSupport={() => setSupportModalType("support")}
      />

      {/* MAIN ENGINE */}
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

      {/* LISTINGS */}
      {showAllListings ? (
        <AllListings onOpenAsset={openAssetFromSf} />
      ) : (
        <>
          <FeaturedSection onOpenAsset={openAssetFromJet} />
          <VerifiedSection onOpenAsset={openAssetFromJet} />
        </>
      )}

      {/* FOOTER */}
      <Footer />

      {/* ASSET MODAL */}
      <AssetModal asset={selectedAsset} onClose={closeAssetModal} />

      {/* COMPARE MODAL */}
      <CompareModal items={compareItems} onClose={closeCompareModal} />

      {/* SELLER MODE */}
      <SellerMode
        open={sellerModeOpen}
        onClose={() => setSellerModeOpen(false)}
        jets={jets}
        onOpenAsset={openAssetFromJet}
        onToggleChat={() => setMessagingOpen(true)}
        showToast={showToast}
      />

      {/* TOAST */}
      <Toast />

      {/* MESSAGING */}
      <MessagingPage
        open={messagingOpen}
        onClose={() => setMessagingOpen(false)}
      />

      {/* SUPPORT / REPORT PROBLEM MODALS */}
      <SupportModals
        modalType={supportModalType}
        onClose={() => setSupportModalType(null)}
      />
    </>
  );
}