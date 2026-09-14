"use client";

import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import AllListings from "../../components/AllListings";

export default function ListingsPage() {
  const router = useRouter();

  return (
    <AppShell>
      {({ openAssetFromSf }) => (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "20px clamp(20px, 4vw, 64px) 0",
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="all-listings-view-all"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back
            </button>
          </div>

          <AllListings onOpenAsset={openAssetFromSf} />
        </>
      )}
    </AppShell>
  );
}