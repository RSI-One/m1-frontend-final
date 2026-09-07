"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import LoiForm from "./LoiForm";
import type { AcquisitionStep } from "./acquisitionSteps";
import type { LoiRecord } from "./types";

function stageStatus(stepId: number, currentStep: number) {
  if (stepId < currentStep) return { label: "Completed", tone: "text-silver bg-white/[0.06]" };
  if (stepId === currentStep) return { label: "In Progress", tone: "text-champagne bg-champagne/10" };
  return { label: "Pending", tone: "text-silver-dim bg-white/[0.03]" };
}

type StepContentProps = {
  steps: AcquisitionStep[];
  viewingStep: number;
  currentStep: number;
  direction: number;
  onPrev: () => void;
  onNext: () => void;
  loiRecord: LoiRecord | null;
  onLoiSubmit: (data: { fileName: string | null; notes: string; keyDate: string | null }) => void;
  onLoiSimulateApproval: () => void;
};

export default function StepContent({
  steps,
  viewingStep,
  currentStep,
  direction,
  onPrev,
  onNext,
  loiRecord,
  onLoiSubmit,
  onLoiSimulateApproval,
}: StepContentProps) {
  const step = steps.find((s) => s.id === viewingStep);
  if (!step) return null;
  const status = stageStatus(step.id, currentStep);
  const Icon = step.icon;
  const isLocked = step.id > currentStep;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto px-4 sm:px-6 py-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-panel-2 border border-white/10 text-champagne">
                <Icon size={13} />
              </div>
              <h3 className="font-display text-lg sm:text-xl text-champagne">{step.label}</h3>
              <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${status.tone}`}>
                {status.label}
              </span>
            </div>

            <p className="font-body text-[13px] leading-relaxed text-silver mb-3.5">{step.detail}</p>

            {isLocked ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-3">
                <Lock size={13} className="mt-0.5 text-silver-dim shrink-0" />
                <p className="text-[11px] leading-relaxed text-silver-dim font-body">
                  This stage hasn&rsquo;t started yet. It updates once the current stage is complete.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-3">
                <p className="text-[11px] leading-relaxed text-silver font-body">{step.summary}</p>
              </div>
            )}

            {step.key === "letter-of-intent" &&
              !isLocked &&
              (step.id === currentStep || loiRecord ? (
                <LoiForm loiRecord={loiRecord} onSubmit={onLoiSubmit} onSimulateApproval={onLoiSimulateApproval} />
              ) : (
                <div className="mt-3.5 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-3">
                  <p className="text-[11px] leading-relaxed text-silver-dim font-body">
                    No Letter of Intent was submitted at this stage.
                  </p>
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1.5">
        <button
          onClick={onPrev}
          disabled={viewingStep === 1}
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-panel/80 text-silver backdrop-blur transition hover:border-white/30 hover:text-champagne disabled:opacity-0"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          onClick={onNext}
          disabled={viewingStep === steps.length}
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-panel/80 text-silver backdrop-blur transition hover:border-white/30 hover:text-champagne disabled:opacity-0"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
