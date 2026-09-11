"use client";

import { Check } from "lucide-react";
import type { AcquisitionStep } from "./acquisitionSteps";

type StepBubblesProps = {
  steps: AcquisitionStep[];
  currentStep: number;
  viewingStep: number;
  onSelect: (id: number) => void;
};

export default function StepBubbles({ steps, currentStep, viewingStep, onSelect }: StepBubblesProps) {
  return (
    <div className="w-full bg-panel/60">
      <div className="overflow-x-auto no-scrollbar px-4 sm:px-6 py-3">
        <div className="flex min-w-max items-center gap-1.5">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrentStage = step.id === currentStep;
            const isBeingViewed = step.id === viewingStep;

            return (
              <button key={step.id} onClick={() => onSelect(step.id)} title={step.label} className="shrink-0 -skew-x-[12deg] focus:outline-none">
                <div
                  className={[
                    "flex h-8 min-w-[34px] items-center justify-center gap-1 px-2.5 border transition-all duration-200",
                    isCompleted
                      ? "bg-silver/90 border-silver text-bg"
                      : isCurrentStage
                      ? "bg-champagne border-champagne text-bg"
                      : "bg-panel-2 border-white/10 text-silver-dim",
                    isBeingViewed && !isCurrentStage && !isCompleted ? "border-silver/50 text-silver" : "",
                  ].join(" ")}
                >
                  <span className="skew-x-[12deg] flex items-center gap-1">
                    {isCompleted ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <span className="font-mono text-[10px] font-semibold">{String(step.id).padStart(2, "0")}</span>
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-4 sm:px-6 pb-2.5 -mt-1">
        <span className="text-[11px] font-body text-silver-dim">
          Stage {String(viewingStep).padStart(2, "0")}/{steps.length} ·{" "}
          <span className="text-champagne">{steps.find((s) => s.id === viewingStep)?.label}</span>
        </span>
      </div>
    </div>
  );
}
