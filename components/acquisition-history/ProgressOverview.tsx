"use client";

import { useState } from "react";
import { Check, Eye, FileSignature, ShieldCheck, FileText, ScrollText, ArrowRight } from "lucide-react";
import {
  PROGRESS_MILESTONES,
  DOCUMENT_META,
  getMilestoneStates,
  getDocumentStatuses,
  getProgressSummary,
} from "./acquisitionSteps";
import DocumentPreviewModal from "./DocumentPreviewModal";
import type { BuyerAcquisition, LoiRecord } from "./types";

const STATUS_TONE: Record<string, string> = {
  Pending: "text-silver-dim bg-white/[0.04] border-white/10",
  Draft: "text-silver-dim bg-white/[0.04] border-white/10",
  "Under Verification": "text-gold-bright bg-gold/10 border-gold/30",
  Sent: "text-gold-bright bg-gold/10 border-gold/30",
  Uploaded: "text-gold-bright bg-gold/10 border-gold/30",
  Verified: "text-champagne bg-champagne/10 border-champagne/30",
  Published: "text-champagne bg-champagne/10 border-champagne/30",
  Signed: "text-champagne bg-champagne/10 border-champagne/30",
  Approved: "text-champagne bg-champagne/10 border-champagne/30",
  Completed: "text-bg bg-champagne border-champagne",
  Rejected: "text-red-400 bg-red-500/10 border-red-500/30",
};

function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] || STATUS_TONE.Pending;
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${tone}`}>
      {status}
    </span>
  );
}

const DOC_ROWS: { key: "letterOfIntent" | "saleAgreement" | "agreementLetter"; label: string; icon: typeof FileSignature }[] = [
  { key: "letterOfIntent", label: "Letter of Intent", icon: FileSignature },
  { key: "saleAgreement", label: "Sale Agreement", icon: FileText },
  { key: "agreementLetter", label: "Agreement Letter", icon: ScrollText },
];

type ProgressOverviewProps = {
  acquisition: BuyerAcquisition;
  loiRecord: LoiRecord | null;
};

export default function ProgressOverview({ acquisition, loiRecord }: ProgressOverviewProps) {
  const { currentStep, status } = acquisition;
  const states = getMilestoneStates(currentStep, status);
  const docs = getDocumentStatuses(currentStep, status);
  const summary = getProgressSummary(currentStep, status);
  const [previewKey, setPreviewKey] = useState<null | "letterOfIntent" | "saleAgreement" | "agreementLetter">(null);

  const loiStatus = !loiRecord ? "Pending" : loiRecord.approvalStatus === "Approved" ? "Approved" : "Uploaded";
  const docStatuses = { ...docs, letterOfIntent: loiStatus };
  const docDates: Record<string, string | null> = {
    letterOfIntent: loiRecord?.submittedOn || null,
    saleAgreement: docs.saleAgreement !== "Draft" ? acquisition.startedOn ?? null : null,
    agreementLetter: docs.agreementLetter !== "Draft" ? acquisition.startedOn ?? null : null,
  };

  const documentsUnlocked = currentStep >= 3;

  return (
    <div className="border-b border-white/10 bg-panel/40 px-4 sm:px-6 py-3.5 space-y-4">
      <div>
        <div className="flex items-center">
          {PROGRESS_MILESTONES.map((m, i) => {
            const state = states[m.key].state;
            const isLast = i === PROGRESS_MILESTONES.length - 1;
            return (
              <div key={m.key} className="flex flex-1 items-center last:flex-none">
                <div
                  title={m.label}
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-mono font-bold transition-colors",
                    state === "done"
                      ? "border-champagne bg-champagne text-bg"
                      : state === "active"
                      ? "border-champagne bg-champagne/15 text-champagne animate-pulse"
                      : "border-white/15 bg-panel-2 text-silver-dim",
                  ].join(" ")}
                >
                  {state === "done" ? <Check size={10} strokeWidth={3} /> : i + 1}
                </div>
                {!isLast && (
                  <div
                    className={[
                      "mx-1 h-[2px] flex-1 rounded-full transition-colors",
                      state === "done" ? "bg-champagne" : "bg-white/10",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 grid grid-cols-6 gap-0.5">
          {PROGRESS_MILESTONES.map((m) => (
            <span
              key={m.key}
              className={[
                "text-center text-[7.5px] sm:text-[8px] font-mono uppercase tracking-tight leading-tight",
                states[m.key].state === "pending" ? "text-silver-dim" : "text-silver",
              ].join(" ")}
            >
              {m.shortLabel}
            </span>
          ))}
        </div>
      </div>

      <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-body text-silver">
        <span className="text-silver-dim">Current:</span>
        <span className="text-champagne font-semibold">{summary.current}</span>
        {summary.next && (
          <>
            <ArrowRight size={11} className="text-silver-dim shrink-0" />
            <span className="text-silver-dim">Next / Pending Action:</span>
            <span className="text-silver">{summary.next}</span>
          </>
        )}
      </p>

      <div>
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-silver-dim">Verification Status</p>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
          <span className="flex items-center gap-1.5 min-w-0 text-[10px] font-body text-silver">
            <ShieldCheck size={11} className="shrink-0 text-silver-dim" />
            <span className="truncate">M1 Asset Verification</span>
          </span>
          <StatusBadge status={docs.verification} />
        </div>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-silver-dim">Documents</p>
        {!documentsUnlocked ? (
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <p className="text-[10px] font-body text-silver-dim">
              Documents will appear here once the Letter of Intent stage begins.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {DOC_ROWS.map((row) => {
              const Icon = row.icon;
              const docStatus = docStatuses[row.key];
              const docDate = docDates[row.key];
              const meta = DOCUMENT_META[row.key];
              const isAvailable = row.key === "letterOfIntent" ? Boolean(loiRecord) : meta.availableWhen(docs);
              return (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5"
                >
                  <span className="flex items-center gap-1.5 min-w-0 text-[10px] font-body text-silver">
                    <Icon size={11} className="shrink-0 text-silver-dim" />
                    <span className="truncate">{row.label}</span>
                    {docDate && <span className="shrink-0 font-mono text-[8.5px] text-silver-dim">· {docDate}</span>}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={docStatus} />
                    <button
                      onClick={() => isAvailable && setPreviewKey(row.key)}
                      disabled={!isAvailable}
                      title={isAvailable ? "Preview document" : "Not available yet"}
                      className={[
                        "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider transition",
                        isAvailable
                          ? "border-white/15 text-silver hover:border-champagne/50 hover:text-champagne hover:bg-champagne/5"
                          : "border-white/[0.06] text-silver-dim/50 cursor-not-allowed",
                      ].join(" ")}
                    >
                      <Eye size={10} />
                      Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewKey && (
        <DocumentPreviewModal
          docKey={previewKey}
          acquisition={acquisition}
          status={docStatuses[previewKey]}
          loiRecord={previewKey === "letterOfIntent" ? loiRecord : null}
          onClose={() => setPreviewKey(null)}
        />
      )}
    </div>
  );
}
