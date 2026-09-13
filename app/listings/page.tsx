"use client";

import AppShell from "../../components/AppShell";
import AllListings from "../../components/AllListings";

export default function ListingsPage() {
  return (
    <AppShell>
      {({ openAssetFromSf }) => <AllListings onOpenAsset={openAssetFromSf} />}
    </AppShell>
  );
}