import { apiGet, apiPatch, apiPost, apiDelete, apiUpload } from "./client";

export interface UserProfileRead {
  full_name: string | null;
  company_name: string | null;
  location: string | null;
  profile_picture_url: string | null;
  bio: string | null;
  phone_number: string | null;
  user_id: string;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  company_name?: string | null;
  location?: string | null;
  profile_picture_url?: string | null;
  bio?: string | null;
  phone_number?: string | null;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export async function getMyProfile(): Promise<UserProfileRead> {
  return apiGet<UserProfileRead>("/profile/me");
}

export async function updateMyProfile(payload: UserProfileUpdate): Promise<UserProfileRead> {
  return apiPatch<UserProfileRead>("/profile/me", payload);
}

export async function changeMyPassword(payload: ChangePasswordPayload): Promise<void> {
  await apiPost("/profile/me/change-password", payload);
}

export async function uploadMyProfilePhoto(file: File): Promise<UserProfileRead> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<UserProfileRead>("/profile/me/photo", formData);
}

export async function deleteMyProfilePhoto(): Promise<void> {
  await apiDelete("/profile/me/photo");
}