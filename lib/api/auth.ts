import { apiGet, apiPost } from "./client";

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

// ---------- LOGIN ----------
// Backend uses httpOnly cookies for the access + refresh tokens
// (see client.ts: every request goes out with credentials: "include",
// and /auth/refresh relies on the refresh_token cookie). There is no
// access_token field in any of these response bodies — nothing to
// extract or store client-side beyond the returned user object.

export async function login(email: string, password: string): Promise<LoginPinResponse> {
  return apiPost<LoginPinResponse>("/auth/login", { email, password });
}

export async function verifyLoginPin(sessionId: string, code: string): Promise<UserRead> {
  const user = await apiPost<UserRead>("/auth/login/verify-pin", {
    session_id: sessionId,
    code,
  });

  if (user?.id && typeof window !== "undefined") {
    localStorage.setItem("user_id", String(user.id));
  }

  return user;
}

export async function resendLoginPin(sessionId: string): Promise<void> {
  await apiPost("/auth/login/resend-pin", { session_id: sessionId });
}

// ---------- LOGOUT ----------
export async function logout(): Promise<void> {
  await apiPost("/auth/logout");
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_id");
  }
}

// ---------- SIGNUP / EMAIL VERIFICATION ----------
export async function signup(payload: SignupPayload): Promise<UserRead> {
  return apiPost<UserRead>("/auth/signup", payload);
}

export async function verifyEmail(code: string): Promise<UserRead> {
  return apiPost<UserRead>("/auth/verify-email", undefined, {
    params: { token: code },
  });
}

export async function resendVerification(email: string): Promise<void> {
  await apiPost("/auth/resend-verification", { email });
}

// ---------- PASSWORD RESET ----------
export async function forgotPassword(email: string): Promise<void> {
  await apiPost("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiPost("/auth/reset-password", { password: newPassword }, { params: { token } });
}

// ---------- CURRENT USER ----------
export async function getMe(): Promise<UserRead> {
  return apiGet<UserRead>("/auth/me", undefined, { auth: true });
}