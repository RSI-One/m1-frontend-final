"use client";

import { useState } from "react";
import AuthScreen from "./auth/AuthScreen";
import Header from "./Header";
import Footer from "./Footer";
import AssetModal from "./AssetModal";
import CompareModal from "./CompareModal";
import Toast from "./Toast";
import SupportModals from "./SupportModals";
import MessagingPage from "./MessagingPage";
import SellerMode from "./SellerMode";
import AcquisitionHistoryPage from "./acquisition-history/AcquisitionHistoryPage";

import { useSite } from "../lib/site-context";
import { Jet, SfItem } from "../lib/types";
import { jets } from "../lib/data";

interface AppShellProps {
  children: (helpers: {
    openAssetFromSf: (item: SfItem) => void;
    openAssetFromJet: (jet: Jet) => void;
    openCompareModal: (items: SfItem[]) => void;
  }) => React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { showToast, user, isAuthLoading, refreshUser } = useSite();

  const [supportModalType, setSupportModalType] = useState<"report" | "support" | null>(null);
  const [acquisitionHistoryOpen, setAcquisitionHistoryOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Jet | SfItem | null>(null);
  const [compareItems, setCompareItems] = useState<SfItem[]>([]);
  const [sellerModeOpen, setSellerModeOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);

  const openSellerMode = () => {
    setAcquisitionHistoryOpen(false);
    setMessagingOpen(false);
    setSupportModalType(null);
    setSellerModeOpen(true);
  };

  const openAcquisitionHistory = () => {
    setSellerModeOpen(false);
    setMessagingOpen(false);
    setSupportModalType(null);
    setAcquisitionHistoryOpen(true);
  };

  const openMessaging = () => {
    setSellerModeOpen(false);
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

  if (!user) {
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

      {children({ openAssetFromSf, openAssetFromJet, openCompareModal })}

      <Footer />

      <AssetModal asset={selectedAsset} onClose={closeAssetModal} />
      <CompareModal items={compareItems} onClose={closeCompareModal} />

      <SellerMode
        open={sellerModeOpen}
        onClose={() => setSellerModeOpen(false)}
        jets={jets}
        onOpenAsset={openAssetFromJet}
        onToggleChat={openMessaging}
        showToast={showToast}
        onOpenAcquisitionHistory={openAcquisitionHistory}
        onOpenReportProblem={() => setSupportModalType("report")}
        onOpenGetSupport={() => setSupportModalType("support")}
      />

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