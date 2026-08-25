const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

const ACCESS_TOKEN_KEY = "m1_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Attach the bearer token if one is stored. Default: true. */
  auth?: boolean;
  params?: QueryParams;
  body?: unknown;
  /** Internal — prevents infinite refresh loops. Do not set this yourself. */
  _isRetry?: boolean;
}

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

// Ensures we only ever have ONE /auth/refresh call in flight at a time —
// if five requests 401 at once, they all await this same promise instead
// of firing five separate refresh calls.
let refreshPromise: Promise<boolean> | null = null;

async function trySilentRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Paths that should never trigger a silent-refresh retry loop — either
// because they're the refresh call itself, or because a 401 from them is
// an expected/legitimate outcome (bad credentials, bad PIN) rather than an
// expired access token.
const NO_REFRESH_RETRY_PATHS = [
  "/auth/refresh",
  "/auth/login",
  "/auth/login/verify-pin",
  "/auth/login/resend-pin",
];

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, params, headers, body, _isRetry, ...rest } = options;
  const url = buildUrl(path, params);

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Access token cookie expired (15 min) — try one silent refresh using
  // the httpOnly refresh_token cookie, then retry this exact request once.
  // Guarded by _isRetry so a second 401 (refresh itself failed / truly
  // logged out) falls through to the normal error handling below instead
  // of looping forever.
  if (
    res.status === 401 &&
    auth &&
    !_isRetry &&
    !NO_REFRESH_RETRY_PATHS.includes(path)
  ) {
    const refreshed = await trySilentRefresh();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _isRetry: true });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const detailMsg =
      payload && typeof payload === "object" && "detail" in (payload as Record<string, unknown>)
        ? (payload as Record<string, unknown>).detail
        : null;
    const message =
      typeof detailMsg === "string"
        ? detailMsg
        : Array.isArray(detailMsg) && detailMsg.length
        ? detailMsg.map((d) => (d && typeof d === "object" && "msg" in d ? (d as any).msg : d)).join(", ")
        : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
}

export const apiGet = <T>(path: string, params?: QueryParams, options?: RequestOptions) =>
  apiRequest<T>(path, { method: "GET", params, ...options });

export const apiPost = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  apiRequest<T>(path, { method: "POST", body, ...options });

export const apiPatch = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  apiRequest<T>(path, { method: "PATCH", body, ...options });

export const apiDelete = <T>(path: string, options?: RequestOptions) =>
  apiRequest<T>(path, { method: "DELETE", ...options });

/** POST a multipart/form-data body (file uploads). Never set Content-Type manually — the browser adds the boundary. */
export async function apiUpload<T>(path: string, formData: FormData, options: Omit<RequestOptions, "body"> = {}): Promise<T> {
  const { auth = true, params, headers, _isRetry, ...rest } = options;
  const url = buildUrl(path, params);

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...rest,
    method: options.method ?? "POST",
    headers: finalHeaders,
    credentials: "include",
    body: formData,
  });

  if (res.status === 401 && auth && !_isRetry) {
    const refreshed = await trySilentRefresh();
    if (refreshed) {
      return apiUpload<T>(path, formData, { ...options, _isRetry: true });
    }
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const rawPayload = await res.text().catch(() => null);
    console.error("RAW ERROR BODY >>>", JSON.stringify(rawPayload), "status:", res.status);
    const detailMsg =
      payload && typeof payload === "object" && "detail" in (payload as Record<string, unknown>)
        ? (payload as Record<string, unknown>).detail
        : null;
    const message = typeof detailMsg === "string" ? detailMsg : `Upload failed with status ${res.status}`;
    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
}