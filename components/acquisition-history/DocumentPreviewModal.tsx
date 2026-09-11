"use client";

import { motion } from "framer-motion";
import { X, FileText, Download, CalendarDays } from "lucide-react";
import { DOCUMENT_META } from "./acquisitionSteps";
import type { LoiRecord } from "./types";

type DocKey = "letterOfIntent" | "saleAgreement" | "agreementLetter";

type DocumentPreviewModalProps = {
  docKey: DocKey;
  acquisition: { id: string; assetName: string };
  status: string;
  loiRecord: LoiRecord | null;
  onClose: () => void;
};

export default function DocumentPreviewModal({ docKey, acquisition, status, loiRecord, onClose }: DocumentPreviewModalProps) {
  const meta = DOCUMENT_META[docKey];
  if (!meta) return null;
  const isLoiWithRecord = docKey === "letterOfIntent" && loiRecord;

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bg/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/95 shadow-glass"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-5 py-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-panel-2 border border-white/10 text-champagne">
              <FileText size={14} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base text-champagne truncate">{meta.title}</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-silver-dim truncate">
                {meta.fileLabel(acquisition.id)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-silver transition hover:bg-white/5 hover:text-champagne"
            aria-label="Close preview"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
          <div className="rounded-lg border border-white/10 bg-champagne text-bg p-5 sm:p-6 shadow-inner">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-bg/10">
              <span className="font-display text-lg">M1 Marketplace</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-bg/50">
                {meta.fileLabel(acquisition.id)}
              </span>
            </div>
            <h4 className="font-display text-xl mb-1">{meta.title}</h4>
            <p className="flex items-center gap-1.5 font-mono text-[10px] text-bg/50 mb-4">
              <CalendarDays size={11} />
              Acquisition · {acquisition.id} · {acquisition.assetName}
            </p>
            <p className="text-[12.5px] leading-relaxed text-bg/80 font-body">
              {isLoiWithRecord
                ? loiRecord?.notes || "No additional notes were provided with this submission."
                : meta.body(acquisition)}
            </p>
            {isLoiWithRecord && loiRecord?.keyDate && (
              <p className="mt-2 text-[11px] font-body text-bg/70">
                <span className="font-semibold">Key date:</span> {loiRecord.keyDate}
              </p>
            )}
            {isLoiWithRecord && loiRecord?.fileName && (
              <p className="mt-1 text-[11px] font-body text-bg/70">
                <span className="font-semibold">Attachment:</span> {loiRecord.fileName}
              </p>
            )}
            <div className="mt-6 pt-4 border-t border-bg/10 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-bg/50">Status: {status}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-bg/50">
                {isLoiWithRecord ? `Submitted on ${loiRecord?.submittedOn}` : "Issued by M1 Admin"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 sm:px-5 py-3">
          <span className="text-[10.5px] font-body text-silver-dim">Read-only preview · provided by M1</span>
          <button
            disabled
            title="Download will be available once the platform integrates document storage"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-silver-dim cursor-not-allowed"
          >
            <Download size={12} />
            Download
          </button>
        </div>
      </motion.div>
    </div>
  );
}