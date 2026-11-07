"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Jet } from "../lib/types";
import { jets } from "../lib/data";

interface SavedAssetsModalProps {
  open: boolean;
  onClose: () => void;
  onSelectAsset?: (jet: Jet) => void;
}

export default function SavedAssetsModal({
  open,
  onClose,
  onSelectAsset,
}: SavedAssetsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [savedJets, setSavedJets] = useState<Jet[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved assets from localStorage or fallback to initial favorites
  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem("m1_saved_assets");
      if (stored) {
        const parsedIds = JSON.parse(stored) as string[];
        const matched = jets.filter((j) => parsedIds.includes(j.id || j.name));
        setSavedJets(matched.length > 0 ? matched : [jets[0], jets[1]]);
      } else {
        // Initial curated saved favorites
        setSavedJets([jets[0], jets[1]]);
        localStorage.setItem("m1_saved_assets", JSON.stringify([jets[0].id || jets[0].name, jets[1].id || jets[1].name]));
      }
    } catch {
      setSavedJets([jets[0], jets[1]]);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const removeSaved = (idOrName: string) => {
    const updated = savedJets.filter((j) => (j.id || j.name) !== idOrName);
    setSavedJets(updated);
    try {
      localStorage.setItem("m1_saved_assets", JSON.stringify(updated.map((j) => j.id || j.name)));
    } catch {
      // ignore
    }
  };

  if (!mounted || !open) return null;

  const content = (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#14161b] to-[#0c0d10] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-white overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-semibold">
              ♥
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-wide text-white uppercase font-sans">
                Saved Assets Portfolio
              </h3>
              <p className="text-xs text-zinc-400">
                {savedJets.length} private {savedJets.length === 1 ? "aircraft" : "aircraft"} in your bookmarked fleet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all text-sm cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedJets.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 space-y-3">
              <div className="text-3xl text-zinc-600">♡</div>
              <div className="text-sm font-medium text-zinc-300">Your Saved Portfolio is Empty</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Heart any aircraft or yacht from the marketplace to track its valuation, updates, and availability.
              </p>
            </div>
          ) : (
            savedJets.map((jet) => (
              <div
                key={jet.id || jet.name}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/40 shrink-0">
                    <img
                      src={jet.image || "/images/hero.png"}
                      alt={jet.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
                      {jet.cat || "Executive Aircraft"}
                    </div>
                    <div className="text-sm font-semibold text-white tracking-wide">
                      {jet.name}
                    </div>
                    <div className="text-xs text-amber-400 font-mono font-medium mt-0.5">
                      {jet.price} · {jet.loc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectAsset?.(jet);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg bg-white text-black hover:bg-zinc-200 transition-all shadow-sm cursor-pointer"
                  >
                    Inspect
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSaved(jet.id || jet.name)}
                    className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                    title="Remove from saved"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-xs text-zinc-500">
          <span>Private Client Portfolio Sync</span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

