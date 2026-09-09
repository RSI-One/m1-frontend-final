"use client";

import { useState, type FormEvent } from "react";
import { Paperclip, CalendarDays, Send, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import type { LoiRecord } from "./types";

const APPROVAL_TONE: Record<string, string> = {
  Pending: "text-gold-bright bg-gold/10 border-gold/30",
  Approved: "text-champagne bg-champagne/10 border-champagne/30",
};

type LoiFormProps = {
  loiRecord: LoiRecord | null;
  onSubmit: (data: { fileName: string | null; notes: string; keyDate: string | null }) => void;
  onSimulateApproval?: () => void;
  submittedBy?: string;
};

// NOTE: there is no buyer-facing "submit LOI" endpoint in the backend's
// OpenAPI spec today (LOI/meeting endpoints under /admin/acquisitions are
// admin-only). This form is kept local-state-only, same as the uploaded
// design's demo behaviour, until a real buyer endpoint exists.
export default function LoiForm({ loiRecord, onSubmit, onSimulateApproval, submittedBy = "You" }: LoiFormProps) {
  const [fileName, setFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [keyDate, setKeyDate] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!notes.trim() && !fileName) return;
    onSubmit({ fileName: fileName || null, notes: notes.trim(), keyDate: keyDate || null });
  };

  if (loiRecord) {
    return (
      <div className="mt-3.5 rounded-lg border border-champagne/20 bg-champagne/[0.04] px-3.5 py-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-champagne">
            <CheckCircle2 size={13} />
            Letter of Intent submitted
          </span>
          <span
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${
              APPROVAL_TONE[loiRecord.approvalStatus] || APPROVAL_TONE.Pending
            }`}
          >
            {loiRecord.approvalStatus === "Approved" ? <ShieldCheck size={9} /> : <Clock size={9} />}
            {loiRecord.approvalStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10.5px] font-body text-silver">
          <p>
            <span className="text-silver-dim">Submitted by:</span> {submittedBy}
          </p>
          <p>
            <span className="text-silver-dim">Submitted on:</span> {loiRecord.submittedOn}
          </p>
          {loiRecord.keyDate && (
            <p className="col-span-2">
              <span className="text-silver-dim">Key date:</span> {loiRecord.keyDate}
            </p>
          )}
          {loiRecord.fileName && (
            <p className="col-span-2 flex items-center gap-1">
              <Paperclip size={10} className="text-silver-dim" />
              {loiRecord.fileName}
            </p>
          )}
        </div>

        {loiRecord.notes && (
          <div className="rounded-md border border-white/[0.06] bg-bg/40 px-2.5 py-2">
            <p className="mb-0.5 font-mono text-[8.5px] uppercase tracking-widest text-silver-dim">
              Notes · Meeting minutes
            </p>
            <p className="text-[10.5px] leading-relaxed text-silver whitespace-pre-wrap">{loiRecord.notes}</p>
          </div>
        )}

        <p className="text-[10px] font-body text-silver-dim">
          {loiRecord.approvalStatus === "Approved"
            ? "The Partner has reviewed and approved this submission."
            : "The Partner has been notified and can now review this submission."}
        </p>

        {loiRecord.approvalStatus === "Pending" && onSimulateApproval && (
          <button
            onClick={onSimulateApproval}
            className="text-[9.5px] font-mono uppercase tracking-wider text-silver-dim underline decoration-dotted underline-offset-2 hover:text-champagne"
          >
            Demo: simulate Partner approval
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3.5 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-3.5 space-y-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-silver-dim">Submit your Letter of Intent</p>

      <label className="flex items-center gap-2 rounded-md border border-dashed border-white/15 bg-white/[0.02] px-3 py-2.5 cursor-pointer transition hover:border-champagne/40">
        <Paperclip size={13} className="shrink-0 text-silver-dim" />
        <span className="truncate text-[11px] font-body text-silver">
          {fileName || "Attach the LOI document (PDF, DOCX)"}
        </span>
        <input type="file" onChange={handleFile} className="hidden" />
      </label>

      <div>
        <label className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-silver-dim">
          <CalendarDays size={10} />
          Key date <span className="normal-case text-silver-dim/70">(optional)</span>
        </label>
        <input
          type="date"
          value={keyDate}
          onChange={(e) => setKeyDate(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-bg/40 px-2.5 py-1.5 text-[11px] text-silver outline-none transition focus:border-champagne/40"
        />
      </div>

      <div>
        <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-silver-dim">
          Notes · meeting minutes · extra details
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Summarize the coordinated meeting, agreed terms, and anything the Partner should know before reviewing this LOI..."
          className="w-full resize-none rounded-md border border-white/10 bg-bg/40 px-2.5 py-2 text-[11px] leading-relaxed text-silver outline-none transition focus:border-champagne/40 placeholder:text-silver-dim/50"
        />
      </div>

      <button
        type="submit"
        disabled={!notes.trim() && !fileName}
        className="flex w-full items-center justify-center gap-1.5 rounded-md bg-champagne px-4 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-bg transition hover:bg-white disabled:cursor-not-allowed disabled:bg-panel-2 disabled:text-silver-dim"
      >
        <Send size={12} />
        Submit &amp; notify Partner
      </button>
    </form>
  );
}
