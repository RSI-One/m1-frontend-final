import axios from "axios";

// IMPORTANT: this fallback must match lib/client.ts exactly. "localhost"
// and "127.0.0.1" are different origins to the browser, so if this client
// and client.ts ever point at different hosts, the httpOnly session
// cookie set during login (on whichever host client.ts used) will not be
// sent on requests made through this axios instance — every call here
// will silently come back 401 "Missing or invalid authentication
// credentials" even though the user is genuinely logged in.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("m1_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ---- Response envelope unwrapping ----
// The backend wraps most responses as:
//   { success: boolean, status_code: number, message: string, data: <actual payload> }
// but the OpenAPI schema documents endpoints as returning the payload
// directly (e.g. ConversationRead[] instead of { data: ConversationRead[] }).
// Every api/*.ts helper in this codebase (messaging.ts, search.ts, etc.)
// was written against the documented (unwrapped) shape, so without this
// interceptor `const { data } = await api.get(...)` resolves to the whole
// envelope object instead of the actual array/object — which silently
// breaks every list/get call across the app (empty lists, undefined
// fields) without throwing any error.
//
// This interceptor detects the envelope shape and swaps response.data for
// response.data.data, so all existing call sites keep working unchanged.
// Responses that do NOT match the envelope shape (e.g. a raw array, or an
// endpoint that legitimately returns { data: ... } as its real payload)
// are left untouched.
function isEnvelope(payload: unknown): payload is { success: boolean; status_code: number; message?: string; data: unknown } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    !Array.isArray(payload) &&
    "success" in payload &&
    "status_code" in payload &&
    "data" in payload
  );
}

api.interceptors.response.use(
  (response) => {
    if (isEnvelope(response.data)) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Some backends wrap error bodies the same way, e.g.
    // { success: false, status_code: 404, message: "Not found", data: null }.
    // Surface `message` as `detail` too, since a lot of existing error
    // handling in this codebase reads err.response.data.detail
    // (FastAPI's default validation error shape).
    if (error?.response?.data && isEnvelope(error.response.data)) {
      const envelope = error.response.data;
      error.response.data = {
        ...envelope,
        detail: (envelope as any).message ?? (envelope as any).detail,
      };
    }
    return Promise.reject(error);
  }
);

export default api;