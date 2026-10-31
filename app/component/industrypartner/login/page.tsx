"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, verifyLoginPin, resendLoginPin } from "@/lib/api/auth";
import { setAccessToken } from "@/lib/api/client";

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export default function IndustryPartnerLoginPage() {
  const router = useRouter();

  // Screen state: "credentials" | "pin"
  const [step, setStep] = useState<"credentials" | "pin">("credentials");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  // PIN flow
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pin, setPin] = useState<string[]>(Array(6).fill(""));

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverUnreachable, setServerUnreachable] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const emailError = touched.email && email.length > 0 && !isValidEmail(email);
  const passwordError = touched.password && password.length > 0 && password.length < 6;
  const canSubmitCredentials =
    email.trim().length > 0 &&
    password.length >= 6 &&
    isValidEmail(email) &&
    !loading;

  // ---------- STEP 1: CREDENTIALS SUBMISSION ----------
  const handleCredentialsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSubmitCredentials) return;

    setError(null);
    setServerUnreachable(false);
    setInfoMessage(null);
    setLoading(true);

    // TEMP: Auth bypass for local preview
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      setInfoMessage("Local preview bypass active. Authenticating...");
      setTimeout(() => {
        router.push("/component/industrypartner");
      }, 400);
      return;
    }

    try {
      const res = await login(email.trim(), password);
      const sid = res?.session_id;
      const pinLength = res?.pin_length || 6;

      if (!sid) {
        throw new Error("Missing verification session ID from server.");
      }

      setSessionId(sid);
      setPin(Array(pinLength).fill(""));
      setStep("pin");
    } catch (err: unknown) {
      console.error("Partner login failed:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errMsg.toLowerCase().includes("failed to fetch") ||
        errMsg.toLowerCase().includes("cannot reach") ||
        errMsg.toLowerCase().includes("networkerror")
      ) {
        setServerUnreachable(true);
        setError("Cannot reach the server.");
      } else {
        setError(errMsg || "Invalid partner credentials. Please check your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- STEP 2: PIN VERIFICATION ----------
  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sessionId || loading) return;

    const code = pin.join("");
    if (code.length < pin.length) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError(null);
    setServerUnreachable(false);
    setLoading(true);

    // TEMP: Auth bypass for local preview
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      router.push("/component/industrypartner");
      return;
    }

    try {
      const user = await verifyLoginPin(sessionId, code);
      if (user?.access_token && typeof user.access_token === "string") {
        setAccessToken(user.access_token);
        if (typeof window !== "undefined") {
          localStorage.setItem("m1_access_token", user.access_token);
          localStorage.setItem("access_token", user.access_token);
          if (user.id) localStorage.setItem("user_id", String(user.id));
        }
      }
      router.push("/component/industrypartner");
    } catch (err: unknown) {
      console.error("PIN verification failed:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errMsg.toLowerCase().includes("failed to fetch") ||
        errMsg.toLowerCase().includes("cannot reach")
      ) {
        setServerUnreachable(true);
        setError("Cannot reach the server.");
      } else {
        setError(errMsg || "Incorrect or expired verification code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    if (!sessionId || resending) return;
    setResending(true);
    setError(null);
    setInfoMessage(null);
    try {
      await resendLoginPin(sessionId);
      setInfoMessage("A new verification code has been dispatched to your email.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  const handlePinChange = (index: number, val: string) => {
    const digit = val.slice(-1).replace(/[^0-9]/g, "");
    const next = [...pin];
    next[index] = digit;
    setPin(next);

    // Auto-focus next input
    if (digit && index < pin.length - 1) {
      const nextInput = document.getElementById(`partner-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`partner-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 20%, #171b26 0%, #0d0f14 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src="/images/logo.png"
            alt="M1"
            style={{ width: 44, height: 44, objectFit: "contain" }}
          />
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              M1 Marketplace
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--gold-2, #cda45e)",
              }}
            >
              Industry Partner Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Main Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(18, 21, 28, 0.95)",
          border: "1px solid rgba(205, 164, 94, 0.25)",
          borderRadius: 14,
          padding: "36px 32px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55), 0 0 40px rgba(205, 164, 94, 0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(205, 164, 94, 0.12)",
              color: "var(--gold-2, #cda45e)",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: 999,
              border: "1px solid rgba(205, 164, 94, 0.3)",
              marginBottom: 12,
            }}
          >
            Partner Authentication
          </span>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 6px",
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            {step === "credentials" ? "Partner Console Sign In" : "Security Verification"}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255, 255, 255, 0.65)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {step === "credentials"
              ? "Access your fleet inventory, off-market databases, and acquisition inquiries."
              : `Enter the 6-digit verification code sent to ${email}.`}
          </p>
        </div>

        {/* Server Unreachable Alert */}
        {serverUnreachable && (
          <div
            style={{
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#fca5a5" }}>Cannot reach the server.</span>
            <button
              type="button"
              onClick={() => (step === "credentials" ? handleCredentialsSubmit() : handlePinSubmit())}
              style={{
                background: "rgba(220, 38, 38, 0.35)",
                color: "#ffffff",
                border: "1px solid rgba(220, 38, 38, 0.6)",
                borderRadius: 4,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* General Error Alert */}
        {error && !serverUnreachable && (
          <div
            style={{
              background: "rgba(220, 38, 38, 0.12)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 20,
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Info Message */}
        {infoMessage && (
          <div
            style={{
              background: "rgba(205, 164, 94, 0.12)",
              border: "1px solid rgba(205, 164, 94, 0.3)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 20,
              color: "var(--gold-2, #cda45e)",
              fontSize: 13,
            }}
          >
            {infoMessage}
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label
                htmlFor="partner-email"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.75)",
                  marginBottom: 6,
                }}
              >
                Partner Business Email
              </label>
              <input
                id="partner-email"
                type="email"
                autoComplete="email"
                placeholder="broker@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(10, 12, 16, 0.8)",
                  border: `1px solid ${emailError ? "#ef4444" : "rgba(255, 255, 255, 0.15)"}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 14,
                  color: "#ffffff",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
              {emailError && (
                <span style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "block" }}>
                  Please enter a valid email address.
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="partner-password"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.75)",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <input
                id="partner-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(10, 12, 16, 0.8)",
                  border: `1px solid ${passwordError ? "#ef4444" : "rgba(255, 255, 255, 0.15)"}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 14,
                  color: "#ffffff",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
              {passwordError && (
                <span style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "block" }}>
                  Password must be at least 6 characters.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmitCredentials}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "14px",
                background: canSubmitCredentials
                  ? "linear-gradient(135deg, #cda45e 0%, #b38944 100%)"
                  : "rgba(255, 255, 255, 0.1)",
                color: canSubmitCredentials ? "#0a0c10" : "rgba(255, 255, 255, 0.4)",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                border: "none",
                borderRadius: 8,
                cursor: canSubmitCredentials ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                boxShadow: canSubmitCredentials ? "0 4px 18px rgba(205, 164, 94, 0.3)" : "none",
              }}
            >
              {loading ? "Authenticating…" : "Authenticate Partner"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePinSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.75)",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                6-Digit Security PIN
              </label>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`partner-pin-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(idx, e)}
                    style={{
                      width: 44,
                      height: 52,
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#ffffff",
                      background: "rgba(10, 12, 16, 0.8)",
                      border: "1px solid rgba(205, 164, 94, 0.35)",
                      borderRadius: 8,
                      outline: "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || pin.join("").length < pin.length}
              style={{
                width: "100%",
                padding: "14px",
                background:
                  pin.join("").length === pin.length
                    ? "linear-gradient(135deg, #cda45e 0%, #b38944 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                color: pin.join("").length === pin.length ? "#0a0c10" : "rgba(255, 255, 255, 0.4)",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                border: "none",
                borderRadius: 8,
                cursor: pin.join("").length === pin.length ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "Verifying PIN…" : "Confirm & Enter Console"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
              <button
                type="button"
                onClick={() => setStep("credentials")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Back to credentials
              </button>
              <button
                type="button"
                disabled={resending}
                onClick={handleResendPin}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--gold-2, #cda45e)",
                  cursor: resending ? "not-allowed" : "pointer",
                  padding: 0,
                  fontWeight: 600,
                }}
              >
                {resending ? "Sending…" : "Resend PIN"}
              </button>
            </div>
          </form>
        )}

        {/* Links & Secondary Actions */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          <div>
            New Industry Partner?{" "}
            <Link
              href="/component/industrypartner/signup"
              style={{
                color: "var(--gold-2, #cda45e)",
                fontWeight: 700,
                textDecoration: "none",
                marginLeft: 4,
              }}
            >
              Apply for Partner Circle
            </Link>
          </div>
          <div style={{ marginTop: 12 }}>
            <Link
              href="/"
              style={{
                color: "rgba(255, 255, 255, 0.45)",
                textDecoration: "none",
                fontSize: 12,
              }}
            >
              ← Return to Main Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
