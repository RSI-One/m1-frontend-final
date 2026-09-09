import axios from "axios";

// IMPORTANT: this fallback must match lib/client.ts exactly. "localhost"
// and "127.0.0.1" are different origins to the browser, so if this client
// and client.ts ever point at different hosts, the httpOnly session
// cookie set during login (on whichever host client.ts used) will not be
// sent on requests made through this axios instance — every call here
// will silently come back 401 "Missing or invalid authentication
const getAxiosBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
      if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
        return envUrl.replace(/\/$/, "");
      }
      return "/backend";
    }
  }
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return "http://localhost:8000";
};

const api = axios.create({
  baseURL: getAxiosBaseUrl(),
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