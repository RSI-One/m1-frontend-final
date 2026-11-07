"use client";

import { useState, useEffect } from "react";
import AuthScreen from "./auth/AuthScreen";
import Header from "./Header";
import Footer from "./Footer";
import FloatingNavbar from "./FloatingNavbar";
import AssetModal from "./AssetModal";
import CompareModal from "./CompareModal";
import Toast from "./Toast";
import SupportModals from "./SupportModals";
import MessagingPage from "./MessagingPage";
import NewListingWizard from "./NewListingWizard";
import ListingFiltersDrawer from "./ListingFiltersDrawer";
import AcquisitionHistoryPage from "./acquisition-history/AcquisitionHistoryPage";

import { useSite } from "../lib/site-context";
import { Jet, SfItem } from "../lib/types";
import { jets } from "../lib/data";

interface AppShellProps {
  children: (helpers: {
    openAssetFromSf: (item: SfItem) => void;
    openAssetFromJet: (jet: Jet) => void;
    openCompareModal: (items: SfItem[]) => void;
    openNewListing: () => void;
    refreshKey: number;
  }) => React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { showToast, user, isAuthLoading, refreshUser } = useSite();

  const [supportModalType, setSupportModalType] = useState<"report" | "support" | null>(null);
  const [acquisitionHistoryOpen, setAcquisitionHistoryOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Jet | SfItem | null>(null);
  const [compareItems, setCompareItems] = useState<SfItem[]>([]);
  const [newListingOpen, setNewListingOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [messagingOpen, setMessagingOpen] = useState(false);

  const openNewListing = () => setNewListingOpen(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("seller") === "1" || params.get("seller") === "true") {
        const el = document.getElementById("active-listings");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const openSellerMode = () => {
    setAcquisitionHistoryOpen(false);
    setMessagingOpen(false);
    setSupportModalType(null);
    const el = document.getElementById("active-listings");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const openAcquisitionHistory = () => {
    setMessagingOpen(false);
    setSupportModalType(null);
    setAcquisitionHistoryOpen(true);
  };

  const openMessaging = () => {
    setAcquisitionHistoryOpen(false);
    setMessagingOpen(true);
  };

  const handleAuthSuccess = () => {
    refreshUser();
  };

  const openAssetFromSf = (item: SfItem) => setSelectedAsset(item);
  const openAssetFromJet = (jet: Jet) => setSelectedAsset(jet);
  const closeAssetModal = () => setSelectedAsset(null);
  const openCompareModal = (items: SfItem[]) => setCompareItems(items);
  const closeCompareModal = () => setCompareItems([]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b0d]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  // TEMP: Auth bypass for local preview
  if (!user && process.env.NEXT_PUBLIC_BYPASS_AUTH !== "true") {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <Header
        onToggleChat={openMessaging}
        onOpenSellerMode={openSellerMode}
        onOpenReportProblem={() => setSupportModalType("report")}
        onOpenGetSupport={() => setSupportModalType("support")}
        onOpenAcquisitionHistory={openAcquisitionHistory}
      />

      {children({ openAssetFromSf, openAssetFromJet, openCompareModal, openNewListing, refreshKey })}

      <Footer onOpenSellerMode={openSellerMode} />

      <FloatingNavbar
        onToggleChat={openMessaging}
        onOpenNewListing={openNewListing}
        onOpenReportProblem={() => setSupportModalType("report")}
        onOpenGetSupport={() => setSupportModalType("support")}
        onOpenAcquisitionHistory={openAcquisitionHistory}
      />

      <AssetModal asset={selectedAsset} onClose={closeAssetModal} />
      <CompareModal items={compareItems} onClose={closeCompareModal} />

      <NewListingWizard
        open={newListingOpen}
        onClose={() => {
          setNewListingOpen(false);
          setRefreshKey((k) => k + 1);
        }}
        showToast={showToast}
      />

      <ListingFiltersDrawer />

      <Toast />

      <MessagingPage open={messagingOpen} onClose={() => setMessagingOpen(false)} />

      <SupportModals modalType={supportModalType} onClose={() => setSupportModalType(null)} />

      <AcquisitionHistoryPage
        open={acquisitionHistoryOpen}
        onClose={() => setAcquisitionHistoryOpen(false)}
      />
    </>
  );
}