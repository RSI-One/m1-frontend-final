import { apiGet } from './client';

export type VerificationDocument = {
  document_type_id: number;
  file_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
};

export type VerificationDetail = {
  listing_id: string;
  documents?: VerificationDocument[];
  [key: string]: any;
};

export async function getVerificationDetail(
  listingId: string
): Promise<VerificationDetail> {
  return apiGet(`/admin/verifications/${listingId}`);
}