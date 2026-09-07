"use client";

import { useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { ACQUISITION_STEPS, HERO_BANNER, getProgressSummary } from "./acquisitionSteps";
import { normalizeAcquisition, type BuyerAcquisition } from "./types";
import AcquisitionDetailModal from "./AcquisitionDetailModal";
import { api } from "../../lib/api";

type AcquisitionHistoryPageProps = {
  open: boolean;
  onClose: () => void;
};

const STATUS_TABS: { key: "all" | "active" | "cancelled" | "completed"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function AcquisitionHistoryPage({ open, onClose }: AcquisitionHistoryPageProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "cancelled" | "completed">("all");
  const [acquisitions, setAcquisitions] = useState<BuyerAcquisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAcquisition, setActiveAcquisition] = useState<BuyerAcquisition | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    const qs = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    api
      .get<Record<string, unknown>[]>(`/buyer/acquisitions${qs}`)
      .then((data) => setAcquisitions(Array.isArray(data) ? data.map(normalizeAcquisition) : []))
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load acquisition history."))
      .finally(() => setLoading(false));
  }, [open, statusFilter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg">
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-panel/80 text-silver backdrop-blur transition hover:text-champagne"
        aria-label="Close acquisition history"
      >
        <X size={16} />
      </button>

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-8 py-10">
        <div className="relative mb-8 h-40 sm:h-48 w-full overflow-hidden rounded-2xl border border-white/10">
          <img src={HERO_BANNER} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-silver-dim mb-2">Your Acquisitions</p>
        <h1 className="font-display text-3xl sm:text-4xl text-champagne mb-2">Acquisition History</h1>
        <p className="font-body text-sm text-silver-dim mb-6 max-w-lg">
          Every acquisition you&rsquo;ve started with M1, and the stage it&rsquo;s currently at.
        </p>

        <div className="flex items-center gap-2 mb-8">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={[
                "rounded-full border px-3 py-1.5 text-[10.5px] font-mono uppercase tracking-wider transition",
                statusFilter === tab.key
                  ? "border-champagne/50 bg-champagne/10 text-champagne"
                  : "border-white/10 text-silver-dim hover:text-silver",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <p className="font-body text-sm text-silver-dim">Loading…</p>}
        {error && <p className="font-body text-sm text-red-400">{error}</p>}
        {!loading && !error && acquisitions.length === 0 && (
          <p className="font-body text-sm text-silver-dim">
            No {statusFilter === "all" ? "" : statusFilter} acquisitions yet.
          </p>
        )}

        <div className="flex flex-col divide-y divide-white/[0.06]">
          {acquisitions.map((acq) => {
            const step = ACQUISITION_STEPS.find((s) => s.id === acq.currentStep) ?? ACQUISITION_STEPS[0];
            const isClosed = acq.status === "Closed" || acq.status === "completed";
            const progress = getProgressSummary(acq.currentStep, acq.status);
            return (
              <button
                key={acq.id}
                onClick={() => setActiveAcquisition(acq)}
                className="group flex items-center gap-4 py-4 text-left transition hover:bg-white/[0.03] px-2 -mx-2 rounded-lg"
              >
                <img
                  src={acq.thumb}
                  alt={acq.assetName}
                  className="h-14 w-16 sm:h-16 sm:w-20 shrink-0 rounded-lg object-cover border border-white/10"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base sm:text-lg text-champagne truncate">{acq.assetName}</h3>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider shrink-0",
                        isClosed ? "bg-white/[0.06] text-silver" : "bg-champagne/[0.08] text-champagne",
                      ].join(" ")}
                    >
                      {acq.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-mono text-silver-dim">
                    Stage {String(acq.currentStep).padStart(2, "0")}/{ACQUISITION_STEPS.length} · {step.label}
                  </p>
                  <p className="mt-1 text-[10.5px] font-body text-silver-dim">
                    <span className="text-silver-dim">Progress:</span>{" "}
                    <span className="text-champagne font-semibold">{progress.current}</span>
                    {progress.next && <span className="text-silver-dim"> · Next: {progress.next}</span>}
                  </p>

                  <div className="mt-2.5 flex gap-[3px] w-full max-w-xs">
                    {ACQUISITION_STEPS.map((s) => {
                      const filled = s.id <= acq.currentStep;
                      return (
                        <div
                          key={s.id}
                          title={s.label}
                          className={["h-[3px] flex-1 rounded-full transition-all", filled ? (isClosed ? "bg-silver" : "bg-champagne") : "bg-white/[0.08]"].join(
                            " "
                          )}
                        />
                      );
                    })}
                  </div>
                </div>

                <ChevronRight size={16} className="shrink-0 text-silver-dim transition group-hover:text-champagne group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      {activeAcquisition && (
        <AcquisitionDetailModal acquisition={activeAcquisition} onClose={() => setActiveAcquisition(null)} />
      )}
    </div>
  );
}
