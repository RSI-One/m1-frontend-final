import {
  Users,
  ShieldCheck,
  FileSignature,
  Landmark,
  FileText,
  Search,
  Gavel,
  PackageCheck,
  Flag,
  type LucideIcon,
} from "lucide-react";

// Acquisition process, exactly as ported from the uploaded design's 9-stage
// list (Coordinated Meeting -> ... -> Closure).
//
// NOTE — stage-count mismatch: the backend's existing admin acquisition
// module (components/modules/AcquisitionModule.tsx) works off a 7-stage
// list that has no "Aircraft Sale Agreement" or "Closure" step. This file
// keeps the uploaded design's original 9 stages so the UI matches 1:1 —
// but whatever stage number `/buyer/acquisitions` actually returns needs to
// be confirmed against this list (or the two lists reconciled) once you can
// see a real response.
export type AcquisitionStep = {
  id: number;
  key: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  summary: string;
  detail: string;
};

export const ACQUISITION_STEPS: AcquisitionStep[] = [
  {
    id: 1,
    key: "coordinated-meeting",
    label: "Coordinated Meeting",
    shortLabel: "Meeting",
    icon: Users,
    summary:
      "M1, the broker, and the buyer are brought together for a coordinated meeting to open the acquisition.",
    detail:
      "This is where the acquisition officially begins. M1, the seller's broker, and you are coordinated into a single meeting to align on intent, expectations, and next steps before any paperwork moves.",
  },
  {
    id: 2,
    key: "m1-verification",
    label: "M1 Asset Verification",
    shortLabel: "Verification",
    icon: ShieldCheck,
    summary:
      "M1 verifies the asset's documentation to confirm authenticity before the process continues.",
    detail:
      "M1's team reviews the aircraft's ownership, maintenance, and compliance documentation to confirm everything checks out. Nothing moves to the Letter of Intent until verification clears.",
  },
  {
    id: 3,
    key: "letter-of-intent",
    label: "Letter of Intent",
    shortLabel: "LOI",
    icon: FileSignature,
    summary: "The broker and M1 combined prepare the Letter of Intent.",
    detail:
      "A formal Letter of Intent is drafted jointly by the broker and M1, setting out the agreed terms both sides intend to move forward on.",
  },
  {
    id: 4,
    key: "escrow",
    label: "Escrow",
    shortLabel: "Escrow",
    icon: Landmark,
    summary:
      "A 10% security deposit is submitted to the platform as escrow, refundable by M1.",
    detail:
      "You submit a 10% security deposit into escrow, held by the platform. This deposit is refundable by M1 in accordance with the acquisition terms.",
  },
  {
    id: 5,
    key: "sale-agreement",
    label: "Aircraft Sale Agreement",
    shortLabel: "Sale Agreement",
    icon: FileText,
    summary: "The Aircraft Sale Agreement is prepared and finalized between the parties.",
    detail:
      "The formal Aircraft Sale Agreement is drawn up, capturing the finalized terms of the transaction between buyer and seller.",
  },
  {
    id: 6,
    key: "m1-inspection",
    label: "M1 Inspection",
    shortLabel: "Inspection",
    icon: Search,
    summary: "M1 performs a full-cycle inspection of the aircraft.",
    detail:
      "A complete, full-cycle inspection of the aircraft is carried out by M1's team to confirm the asset's condition ahead of a final decision.",
  },
  {
    id: 7,
    key: "final-decision",
    label: "Final Decision",
    shortLabel: "Decision",
    icon: Gavel,
    summary: "The final decision stage — M1's active involvement in the deal concludes here.",
    detail:
      "Based on everything gathered so far, a final decision is reached on the acquisition. This is the point at which M1's active role in the deal stops.",
  },
  {
    id: 8,
    key: "transfer",
    label: "Transfer of Assets",
    shortLabel: "Transfer",
    icon: PackageCheck,
    summary: "M1 coordinates the transfer of the asset to its new owner.",
    detail:
      "Ownership of the aircraft is transferred to you, with M1 coordinating the handover between all parties involved.",
  },
  {
    id: 9,
    key: "closure",
    label: "Closure",
    shortLabel: "Closure",
    icon: Flag,
    summary: "The acquisition process reaches closure.",
    detail: "All steps are complete and the acquisition is formally closed. This asset now belongs to you.",
  },
];

export const PROGRESS_MILESTONES = [
  { key: "application", label: "Application Submitted", shortLabel: "Submitted" },
  { key: "letter", label: "Letter Published", shortLabel: "LOI" },
  { key: "verification", label: "Verification", shortLabel: "Verify" },
  { key: "saleAgreement", label: "Sale Agreement", shortLabel: "Agreement" },
  { key: "agreementLetter", label: "Agreement Letter", shortLabel: "Letter" },
  { key: "completed", label: "Completed", shortLabel: "Done" },
] as const;

type MilestoneState = "done" | "active" | "pending";
type MilestoneKey = (typeof PROGRESS_MILESTONES)[number]["key"];

export function getMilestoneStates(currentStep: number, status?: string) {
  const isClosed = status === "Closed" || status === "completed" || currentStep >= 9;

  const application: { key: MilestoneKey; state: MilestoneState } = { key: "application", state: "done" };
  const verification: { key: MilestoneKey; state: MilestoneState } = {
    key: "verification",
    state: currentStep > 2 ? "done" : currentStep === 2 ? "active" : "pending",
  };
  const letter: { key: MilestoneKey; state: MilestoneState } = {
    key: "letter",
    state: currentStep > 3 ? "done" : currentStep === 3 ? "active" : "pending",
  };
  const saleAgreement: { key: MilestoneKey; state: MilestoneState } = {
    key: "saleAgreement",
    state: currentStep > 5 ? "done" : currentStep === 5 ? "active" : "pending",
  };
  const agreementLetter: { key: MilestoneKey; state: MilestoneState } = {
    key: "agreementLetter",
    state: isClosed || currentStep > 7 ? "done" : currentStep === 7 ? "active" : "pending",
  };
  const completed: { key: MilestoneKey; state: MilestoneState } = {
    key: "completed",
    state: isClosed ? "done" : currentStep === 8 ? "active" : "pending",
  };

  return { application, letter, verification, saleAgreement, agreementLetter, completed };
}

export function getDocumentStatuses(currentStep: number, status?: string) {
  const isClosed = status === "Closed" || status === "completed" || currentStep >= 9;

  const verification = currentStep < 2 ? "Pending" : currentStep === 2 ? "Under Verification" : "Verified";
  const letterOfIntent = currentStep < 3 ? "Draft" : "Published";
  const saleAgreement =
    currentStep < 5 ? "Draft" : currentStep === 5 ? "Sent" : isClosed ? "Completed" : "Signed";
  const agreementLetter =
    currentStep < 7 ? "Draft" : currentStep === 7 ? "Draft" : isClosed ? "Completed" : "Published";

  return { verification, letterOfIntent, saleAgreement, agreementLetter };
}

export const DOCUMENT_META: Record<
  "letterOfIntent" | "saleAgreement" | "agreementLetter",
  {
    title: string;
    fileLabel: (id: string) => string;
    availableWhen: (docs: ReturnType<typeof getDocumentStatuses>) => boolean;
    body: (acq: { assetName: string }) => string;
  }
> = {
  letterOfIntent: {
    title: "Letter of Intent",
    fileLabel: (id) => `LOI-${id}.pdf`,
    availableWhen: (docs) => docs.letterOfIntent === "Published",
    body: (acq) =>
      `This Letter of Intent confirms that ${acq.assetName} is being pursued for acquisition under the terms coordinated between M1, the seller's broker, and the buyer. Both parties intend to proceed toward the Aircraft Sale Agreement on the basis set out here.`,
  },
  saleAgreement: {
    title: "Aircraft Sale Agreement",
    fileLabel: (id) => `SA-${id}.pdf`,
    availableWhen: (docs) => docs.saleAgreement !== "Draft",
    body: (acq) =>
      `This Aircraft Sale Agreement sets out the finalized terms of sale for ${acq.assetName} between the buyer and seller, prepared and administered through the M1 platform.`,
  },
  agreementLetter: {
    title: "Agreement Letter",
    fileLabel: (id) => `AL-${id}.pdf`,
    availableWhen: (docs) => docs.agreementLetter !== "Draft",
    body: (acq) =>
      `This Agreement Letter formally records the terms agreed upon for ${acq.assetName} and accompanies the Aircraft Sale Agreement as part of the closing documentation.`,
  },
};

export function getProgressSummary(currentStep: number, status?: string) {
  const states = getMilestoneStates(currentStep, status);
  const order: MilestoneKey[] = ["application", "letter", "verification", "saleAgreement", "agreementLetter", "completed"];
  const current = order.map((key) => ({ key, ...states[key] })).find((m) => m.state === "active");

  const currentMilestone =
    PROGRESS_MILESTONES.find((m) => m.key === current?.key) ||
    (states.completed.state === "done" ? PROGRESS_MILESTONES[5] : PROGRESS_MILESTONES[0]);

  const currentIndex = order.findIndex((key) => key === (current?.key || "completed"));
  const nextKey = order[currentIndex + 1];
  const nextLabel = nextKey ? PROGRESS_MILESTONES.find((m) => m.key === nextKey)?.label ?? null : null;

  return {
    current: currentMilestone.label,
    next: states.completed.state === "done" ? null : nextLabel,
  };
}

export const HERO_BANNER = "/jets/hero-banner.jpg";
export const FALLBACK_THUMB = "/jets/g650er-thumb.jpg";
export const FALLBACK_BANNER = "/jets/g650er-hero.jpg";
