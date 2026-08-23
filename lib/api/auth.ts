import { apiGet, apiPost } from "./client";
import { setAccessToken } from "./client";

export interface LoginPinResponse {
  session_id: string;
  requires_pin: boolean;
  pin_length: number;
}

export interface UserRead {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  seller_mode_active?: boolean;
  [key: string]: unknown;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export async function login(email: string, password: string): Promise<LoginPinResponse> {
  const res = await apiPost<any>("/auth/login", { email, password });
  // Handles both a flat response and an envelope like { data: {...} }
  return (res && typeof res === "object" && "session_id" in res) ? res : res?.data ?? res;
}

// Tries every common shape a backend might use to return the access token.
// Logs the raw response once so we can confirm the real shape and then
// trim this down to the one that actually matches.
function extractAccessToken(res: any): string | null {
  const candidates = [
    res?.access_token,
    res?.data?.access_token,
    res?.token,
    res?.data?.token,
    res?.tokens?.access_token,
    res?.data?.tokens?.access_token,
    res?.accessToken,
    res?.data?.accessToken,
  ];
  return candidates.find((v) => typeof v === "string" && v.length > 0) ?? null;
}

function extractUser(res: any): UserRead | null {
  const candidates = [res?.user, res?.data?.user, res?.data, res];
  return candidates.find((v) => v && typeof v === "object" && "id" in v) ?? null;
}

export async function verifyLoginPin(sessionId: string, code: string): Promise<UserRead> {
  const res = await apiPost<any>("/auth/login/verify-pin", { session_id: sessionId, code });

  // TEMP DEBUG — remove once the real response shape is confirmed.
  console.log("VERIFY-PIN RESPONSE >>>", JSON.stringify(res, null, 2));

  const token = extractAccessToken(res);
  if (token) {
    setAccessToken(token);
  } else {
    console.warn("VERIFY-PIN: no access token found in response — check shape above.");
  }

  const user = extractUser(res);
  if (user?.id && typeof window !== "undefined") {
    localStorage.setItem("user_id", String(user.id));
  }

  return (user ?? res) as UserRead;
}

export async function resendLoginPin(sessionId: string): Promise<void> {
  await apiPost("/auth/login/resend-pin", { session_id: sessionId });
}

export async function signup(payload: SignupPayload): Promise<UserRead> {
  return apiPost<UserRead>("/auth/signup", payload);
}

export async function verifyEmail(code: string): Promise<UserRead> {
  return apiPost<UserRead>("/auth/verify-email", { token: code });
}

export async function resendVerification(email: string): Promise<void> {
  await apiPost("/auth/resend-verification", { email });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiPost("/auth/forgot-password", { email });
}

export async function getMe(): Promise<UserRead> {
  return apiGet<UserRead>("/auth/me");
}