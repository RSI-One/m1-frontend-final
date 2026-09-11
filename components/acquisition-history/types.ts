import { FALLBACK_BANNER, FALLBACK_THUMB } from "./acquisitionSteps";

export type LoiRecord = {
  fileName: string | null;
  notes: string;
  keyDate: string | null;
  submittedOn: string;
  approvalStatus: "Pending" | "Approved";
};

export type BuyerAcquisition = {
  id: string;
  assetName: string;
  thumb: string;
  banner: string;
  currentStep: number; // 1-9, mapped from whatever the backend returns
  status: string;
  startedOn?: string | null;
  loiRecord: LoiRecord | null;
};

// The backend's OpenAPI spec doesn't declare a response schema for
// /buyer/acquisitions (comes back as an untyped object), so this reads a
// handful of plausible field names defensively. Once you've checked a real
// response in the Network tab, trim this down to the actual field names.
export function normalizeAcquisition(raw: Record<string, unknown>): BuyerAcquisition {
  const id = String(raw.id ?? raw.acquisition_id ?? "");

  const assetName =
    (raw.asset as string) ??
    (raw.asset_name as string) ??
    (raw.aircraft_name as string) ??
    (raw.listing_title as string) ??
    "Untitled asset";

  // Backend stage numbering isn't confirmed against this 9-stage UI list —
  // see the note at the top of acquisitionSteps.ts. Assumes 1-indexed; if
  // the backend sends 0-indexed stages, add 1 here.
  const rawStage = raw.stage ?? raw.current_stage ?? raw.currentStep ?? raw.current_step ?? 1;
  const currentStep = Math.min(9, Math.max(1, Number(rawStage) || 1));

  const status = String(raw.status ?? "active");

  const thumb = (raw.thumbnail_url as string) ?? (raw.thumb as string) ?? FALLBACK_THUMB;
  const banner = (raw.banner_url as string) ?? (raw.banner as string) ?? (raw.thumbnail_url as string) ?? FALLBACK_BANNER;

  const startedOn = (raw.created_at as string) ?? (raw.started_on as string) ?? (raw.startedOn as string) ?? null;

  return { id, assetName, thumb, banner, currentStep, status, startedOn, loiRecord: null };
}
