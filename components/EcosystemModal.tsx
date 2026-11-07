"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EcosystemModalProps {
  open: boolean;
  onClose: () => void;
  onOpenIntelligence?: () => void;
}

export default function EcosystemModal({
  open,
  onClose,
  onOpenIntelligence,
}: EcosystemModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const pillars = [
    {
      title: "M1 Aviation Fleet",
      badge: "Flagship",
      description: "Direct access to off-market heavy jets, ultra-long-range executive aircraft, and supersonic interceptors.",
      icon: "✈",
      actionLabel: "Explore Fleet",
      action: () => {
        onClose();
        const el = document.getElementById("featured");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      title: "Maritime Fleet & Yachts",
      badge: "Verified",
      description: "Curated superyachts and private maritime vessels with verified survey reports and shipyard telemetry.",
      icon: "⚓",
      actionLabel: "View Maritime",
      action: () => {
        onClose();
        const el = document.getElementById("verified");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      title: "SIOS Intelligence Engine",
      badge: "AI 2.0",
      description: "Supersonic Intelligence Operating System providing predictive fleet valuations and acquisition telemetry.",
      icon: "✦",
      actionLabel: "Launch SIOS",
      action: () => {
        onClose();
        onOpenIntelligence?.();
      },
    },
    {
      title: "Industry Partner Portal",
      badge: "B2B Platform",
      description: "Institutional seller console, aircraft import verification pipelines, and syndicated broker inventory.",
      icon: "◈",
      actionLabel: "Open Portal",
      action: () => {
        onClose();
        router.push("/component/industrypartner");
      },
    },
    {
      title: "Private Escrow & Concierge",
      badge: "Sovereign Escrow",
      description: "Multi-sig digital settlement, international title transfers, and discreet off-market closing protocol.",
      icon: "🔒",
      actionLabel: "Escrow Protocol",
      action: () => {
        onClose();
        window.open("https://rsinternational.net", "_blank");
      },
    },
  ];

  const content = (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#14161b] to-[#0c0d10] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-white overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-sm font-semibold">
              ◈
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-wide text-white uppercase font-sans">
                M1 Ecosystem Directory
              </h3>
              <p className="text-xs text-zinc-400">
                Interconnected aviation, maritime, and intelligent acquisition infrastructure
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

        {/* Pillars Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15">
                      {p.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white tracking-wide group-hover:text-amber-300 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    {p.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                  <button
                    type="button"
                    onClick={p.action}
                    className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    <span>{p.actionLabel}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-xs text-zinc-500">
          <span>Global Operations: Toronto · Pickering · Dubai</span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

