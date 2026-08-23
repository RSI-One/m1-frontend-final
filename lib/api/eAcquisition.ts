import { apiGet, apiPatch, apiPost } from "./client";

export type PlaneTypeEnum =
  | "cargo"
  | "public_plane"
  | "turboprop"
  | "helicopter"
  | "light_jet"
  | "mid_size_jet"
  | "heavy_jet"
  | "long_range_jet"
  | "vip_airline";

export type UrgencyEnum = "weeks_3" | "month_1" | "months_3" | "months_6" | "months_12";

export interface EAcquisitionAnswers {
  passengers?: number | null;
  model_year_min?: number | null;
  urgency_weeks?: number | null;
  plane_type?: PlaneTypeEnum | null;
  budget?: number | null;
  range_from?: string | null;
  range_to?: string | null;
  range_nm?: number | null;
  usage_hours_per_year?: number | null;
}

export interface LeadSessionUpdate {
  session_token?: string | null;
  answers: EAcquisitionAnswers;
  name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  business_email?: string | null;
  location?: string | null;
  selected_aircraft_model?: string | null;
}

export interface LeadSessionResponse {
  id: string;
  session_token?: string | null;
  user_id?: string | null;
  name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  business_email?: string | null;
  location?: string | null;
  selected_aircraft_model?: string | null;
  answers: Record<string, unknown>;
  other_jet_suggestions?: unknown[] | null;
  is_complete: boolean;
}


export interface EAcquisitionMatch {
  listing_id?: string;
  aircraft_name?: string;
  manufacturer?: string;
  model?: string;
  variant?: string;
  year_of_manufacture?: number;
  thumbnail?: string;
  price?: number;
  [key: string]: unknown;
}

export interface LeadCreate {
  full_name: string;
  email: string;
  phone_number: string;
  location?: string | null;
  business_email?: string | null;
  plane_type: PlaneTypeEnum;
  budget_min?: number | null;
  budget_max: number;
  range_from_city: string;
  range_to_city: string;
  usage_hours_per_year: number;
  passengers_count: number;
  model_year_min?: number | null;
  acquisition_urgency: UrgencyEnum;
}

export interface LeadResponse {
  id: string;
  status: string;
  full_name: string;
  email: string;
  phone_number: string;
  plane_type: PlaneTypeEnum;
  budget_max: number;
  passengers_count: number;
  acquisition_urgency: UrgencyEnum;
  matched_asset_ids?: string[] | null;
  m1_suggested_asset_ids?: string[] | null;
  created_at: string;
}


export function updateEAcquisitionSession(payload: LeadSessionUpdate) {
  return apiPatch<LeadSessionResponse>("/e-acquisition/session", payload);
}

export async function getSessionMatches(sessionToken: string): Promise<EAcquisitionMatch[]> {
  const raw = await apiGet<unknown>(`/e-acquisition/session/${sessionToken}/matches`, undefined, {
    auth: false,
  });
  if (Array.isArray(raw)) return raw as EAcquisitionMatch[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.results)) return obj.results as EAcquisitionMatch[];
    if (Array.isArray(obj.matches)) return obj.matches as EAcquisitionMatch[];
  }
  return [];
}

export function submitLead(payload: LeadCreate) {
  return apiPost<LeadResponse>("/leads", payload);
}