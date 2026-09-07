"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, CalendarClock, LifeBuoy, ArrowRight, PartyPopper, Undo2 } from "lucide-react";
import StepBubbles from "./StepBubbles";
import StepContent from "./StepContent";
import ProgressOverview from "./ProgressOverview";
import { ACQUISITION_STEPS } from "./acquisitionSteps";
import type { BuyerAcquisition, LoiRecord } from "./types";
import { api } from "../../lib/api";

function ParallelogramButton({
  onClick,
  disabled,
  className = "",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 ${className}`}
      style={{ clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)" }}
    >
      <span className="flex items-center justify-center gap-1.5 px-1">{children}</span>
    </button>
  );
}

type AcquisitionDetailModalProps = {
  acquisition: BuyerAcquisition;
  onClose: () => void;
};

export default function AcquisitionDetailModal({ acquisition, onClose }: AcquisitionDetailModalProps) {
  const [viewingStep, setViewingStep] = useState(acquisition.currentStep);
  const [direction, setDirection] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [loiRecord, setLoiRecord] = useState<LoiRecord | null>(acquisition.loiRecord ?? null);
  const [currentStep, setCurrentStep] = useState(acquisition.currentStep);

  // Pull the live per-stage progress once the modal opens, since the list
  // endpoint may only carry a coarse stage number.
  useEffect(() => {
    api
      .get<{ stage?: number; current_stage?: number }>(`/buyer/acquisitions/${acquisition.id}/progress`)
      .then((res) => {
        const stage = res?.stage ?? res?.current_stage;
        if (typeof stage === "number") {
          const clamped = Math.min(9, Math.max(1, stage));
          setCurrentStep(clamped);
          setViewingStep(clamped);
        }
      })
      .catch(() => {
        // fall back to whatever the list endpoint already gave us
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acquisition.id]);

  const goTo = (id: number) => {
    setDirection(id > viewingStep ? 1 : -1);
    setViewingStep(id);
  };

  const handlePrev = () => viewingStep > 1 && goTo(viewingStep - 1);
  const handleNext = () => viewingStep < ACQUISITION_STEPS.length && goTo(viewingStep + 1);

  const fireToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  // NOTE: "Schedule meeting" and "Support" don't have dedicated buyer
  // endpoints in the backend spec today, so these stay as UI-only
  // acknowledgements (same as the uploaded design's demo behaviour).
  const handleScheduleMeeting = () =>
    fireToast("Your request has been initiated. M1 will soon organize a meeting for both parties.");

  const handleSupport = () => fireToast("Connecting you to M1 support — our team will be with you shortly.");

  const handleLoiSubmit = ({ fileName, notes, keyDate }: { fileName: string | null; notes: string; keyDate: string | null }) => {
    setLoiRecord({
      fileName,
      notes,
      keyDate,
      submittedOn: new Date().toISOString().slice(0, 10),
      approvalStatus: "Pending",
    });
    fireToast("Letter of Intent submitted — the Partner has been notified to review and approve.");
  };

  const handleLoiSimulateApproval = () => {
    setLoiRecord((prev) => (prev ? { ...prev, approvalStatus: "Approved" } : prev));
    fireToast("Partner has approved the Letter of Intent.");
  };

  const isFinalStage = currentStep === ACQUISITION_STEPS.length;
  const isViewingCurrentStage = viewingStep === currentStep;

  // Read-only: advancing a stage is an admin action in this backend
  // (PATCH /admin/acquisitions/{id}/stage/{n}/...), so the buyer UI can
  // browse stages but the "Next"/"Update" action here only re-centers the
  // view on the current stage rather than actually advancing it.
  const handleFooterAction = () => {
    if (!isViewingCurrentStage) {
      goTo(currentStep);
      return;
    }
    fireToast("This stage is managed by M1 — check back once it's updated.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bg/75 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/95 shadow-glass"
      >
        <div className="relative h-36 sm:h-40 w-full shrink-0">
          <img src={acquisition.banner} alt={acquisition.assetName} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-bg/50 text-silver backdrop-blur transition hover:text-champagne"
            aria-label="Close"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-2.5 left-4 right-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-silver-dim">Acquisition · {acquisition.id}</p>
            <h2 className="font-display text-lg sm:text-xl text-champagne">{acquisition.assetName}</h2>
          </div>
        </div>

        <ProgressOverview acquisition={{ ...acquisition, currentStep }} loiRecord={loiRecord} />

        <StepBubbles steps={ACQUISITION_STEPS} currentStep={currentStep} viewingStep={viewingStep} onSelect={goTo} />

        <StepContent
          steps={ACQUISITION_STEPS}
          viewingStep={viewingStep}
          currentStep={currentStep}
          direction={direction}
          onPrev={handlePrev}
          onNext={handleNext}
          loiRecord={loiRecord}
          onLoiSubmit={handleLoiSubmit}
          onLoiSimulateApproval={handleLoiSimulateApproval}
        />

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handleSupport}
              title="Support"
              className="flex h-9 w-9 items-center justify-center rounded-full text-silver transition hover:bg-white/5 hover:text-champagne"
            >
              <LifeBuoy size={16} strokeWidth={1.6} />
            </button>

            <ParallelogramButton
              onClick={handleScheduleMeeting}
              className="h-8 border border-champagne/40 px-4 text-champagne hover:bg-champagne/10 transition"
            >
              <CalendarClock size={12} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Meeting</span>
            </ParallelogramButton>
          </div>

          <ParallelogramButton
            onClick={handleFooterAction}
            disabled={isViewingCurrentStage && isFinalStage}
            className={[
              "h-9 px-5 transition",
              isViewingCurrentStage && isFinalStage
                ? "bg-panel-2 text-silver-dim cursor-not-allowed"
                : "bg-champagne text-bg hover:bg-white",
            ].join(" ")}
          >
            {!isViewingCurrentStage ? (
              <>
                <Undo2 size={13} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Current</span>
              </>
            ) : isFinalStage ? (
              <>
                <PartyPopper size={13} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Done</span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-semibold uppercase tracking-wide">Status</span>
                <ArrowRight size={13} />
              </>
            )}
          </ParallelogramButton>
        </div>

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-1/2 top-3 -translate-x-1/2 rounded-lg border border-white/10 bg-bg/95 px-3.5 py-2 text-[11px] text-champagne shadow-glass max-w-[85%] text-center"
          >
            {toast}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
