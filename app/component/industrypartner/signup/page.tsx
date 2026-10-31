"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/api/auth";

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export default function IndustryPartnerSignupPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    specialization: "Aviation Fleet Operator",
    email: "",
    phoneNumber: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverUnreachable, setServerUnreachable] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Field validation
  const errors: Record<string, string | null> = {
    fullName: touched.fullName && !formData.fullName.trim() ? "Full name is required." : null,
    companyName: touched.companyName && !formData.companyName.trim() ? "Company name is required." : null,
    email:
      touched.email && (!formData.email.trim() || !isValidEmail(formData.email))
        ? "Valid business email is required."
        : null,
    password:
      touched.password && formData.password.length < 6
        ? "Password must be at least 6 characters."
        : null,
    confirmPassword:
      touched.confirmPassword && formData.confirmPassword !== formData.password
        ? "Passwords do not match."
        : null,
  };

  const isFormValid =
    formData.fullName.trim().length > 0 &&
    formData.companyName.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    isValidEmail(formData.email) &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    !loading;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setServerUnreachable(false);
    setLoading(true);

    // TEMP: Auth bypass for local preview
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      setIsSuccess(true);
      setLoading(false);
      return;
    }

    try {
      // Backend public signup supports 'seller' role for inventory partners
      const username = formData.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") + "_" + Math.floor(Math.random() * 1000);
      await signup({
        username,
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.fullName.trim(),
        company_name: formData.companyName.trim(),
        phone_number: formData.phoneNumber.trim() || undefined,
        country: formData.country.trim() || undefined,
        location: formData.specialization,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error("Partner signup failed:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errMsg.toLowerCase().includes("failed to fetch") ||
        errMsg.toLowerCase().includes("cannot reach") ||
        errMsg.toLowerCase().includes("networkerror")
      ) {
        setServerUnreachable(true);
        setError("Cannot reach the server.");
      } else {
        setError(errMsg || "Registration could not be completed. Please try again.");
      }
    } finally {
      setLoading(false);
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
        padding: "32px 16px",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
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
          maxWidth: 520,
          background: "rgba(18, 21, 28, 0.95)",
          border: "1px solid rgba(205, 164, 94, 0.25)",
          borderRadius: 14,
          padding: "36px 32px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55), 0 0 40px rgba(205, 164, 94, 0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        {isSuccess ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(205, 164, 94, 0.15)",
                border: "2px solid var(--gold-2, #cda45e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 28,
                color: "var(--gold-2, #cda45e)",
              }}
            >
              ✓
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", color: "#ffffff" }}>
              Application Submitted
            </h2>
            <p style={{ fontSize: 13.5, color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.6, marginBottom: 24 }}>
              Your partner registration for <strong style={{ color: "#ffffff" }}>{formData.companyName}</strong> has been registered. You may now sign in to your Partner Console.
            </p>
            <Link
              href="/component/industrypartner/login"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "linear-gradient(135deg, #cda45e 0%, #b38944 100%)",
                color: "#0a0c10",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Proceed to Partner Sign In
            </Link>
          </div>
        ) : (
          <>
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
                Exclusive Partner Onboarding
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
                Join the Partner Circle
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.65)", margin: 0 }}>
                Register your brokerage, fleet, or shipyard to list assets and access private buyer demand.
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
                  onClick={() => handleSubmit()}
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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.75)",
                      marginBottom: 6,
                    }}
                  >
                    Representative Name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                    onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(10, 12, 16, 0.8)",
                      border: `1px solid ${errors.fullName ? "#ef4444" : "rgba(255, 255, 255, 0.15)"}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "#ffffff",
                      outline: "none",
                    }}
                  />
                  {errors.fullName && (
                    <span style={{ fontSize: 10.5, color: "#f87171", marginTop: 4, display: "block" }}>
                      {errors.fullName}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.75)",
                      marginBottom: 6,
                    }}
                  >
                    Company / Fleet Name
                  </label>
                  <input
                    type="text"
                    placeholder="Apex Aviation Ltd."
                    value={formData.companyName}
                    onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
                    onBlur={() => setTouched((p) => ({ ...p, companyName: true }))}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(10, 12, 16, 0.8)",
                      border: `1px solid ${errors.companyName ? "#ef4444" : "rgba(255, 255, 255, 0.15)"}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "#ffffff",
                      outline: "none",
                    }}
                  />
                  {errors.companyName && (
                    <span style={{ fontSize: 10.5, color: "#f87171", marginTop: 4, display: "block" }}>
                      {errors.companyName}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(255, 255, 255, 0.75)",
                    marginBottom: 6,
                  }}
                >
                  Partner Specialization
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData((p) => ({ ...p, specialization: e.target.value }))}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(10, 12, 16, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    color: "#ffffff",
                    outline: "none",
                  }}
                >
                  <option value="Aviation Fleet Operator">Aviation Fleet Operator</option>
                  <option value="Maritime Yacht Brokerage">Maritime Yacht Brokerage</option>
                  <option value="Sovereign Asset Manager">Sovereign Asset Manager</option>
                  <option value="VIP Aircraft Charter">VIP Aircraft Charter</option>
                  <option value="Naval Shipyard & Builder">Naval Shipyard & Builder</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.75)",
                      marginBottom: 6,
                    }}
                  >
                    Business Email
                  </label>
                  <input
                    type="email"
                    placeholder="partner@fleet.com"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(10, 12, 16, 0.8)",
                      border: `1px solid ${errors.email ? "#ef4444" : "rgba(255, 255, 255, 0.15)"}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "#ffffff",
                      outline: "none",
                    }}
                  />
                  {errors.email && (
                    <span style={{ fontSize: 10.5, color: "#f87171", marginTop: 4, display: "block" }}>
                      {errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.75)",
                      marginBottom: 6,
                    }}
                  >
                    Country / Hub
                  </label>
                  <input
                    type="text"
                    placeholder="United States, UAE, etc."
                    value={formData.country}
                    onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(10, 12, 16, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "#ffffff",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
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
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(10, 12, 16, 0.8)",
                      border: `1px solid ${errors.password ? "#ef4444" : "rgba(255, 255, 255, 0.15)"}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "#ffffff",
                      outline: "none",
                    }}
                  />
                  {errors.password && (
                    <span style={{ fontSize: 10.5, color: "#f87171", marginTop: 4, display: "block" }}>
                      {errors.password}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.75)",
                      marginBottom: 6,
                    }}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(10, 12, 16, 0.8)",
                      border: `1px solid ${errors.confirmPassword ? "#ef4444" : "rgba(255, 255, 255, 0.15)"}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "#ffffff",
                      outline: "none",
                    }}
                  />
                  {errors.confirmPassword && (
                    <span style={{ fontSize: 10.5, color: "#f87171", marginTop: 4, display: "block" }}>
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: "14px",
                  background: isFormValid
                    ? "linear-gradient(135deg, #cda45e 0%, #b38944 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: isFormValid ? "#0a0c10" : "rgba(255, 255, 255, 0.4)",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  border: "none",
                  borderRadius: 8,
                  cursor: isFormValid ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Submitting Application…" : "Register as Industry Partner"}
              </button>
            </form>

            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                textAlign: "center",
                fontSize: 13,
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              <div>
                Already have a partner account?{" "}
                <Link
                  href="/component/industrypartner/login"
                  style={{
                    color: "var(--gold-2, #cda45e)",
                    fontWeight: 700,
                    textDecoration: "none",
                    marginLeft: 4,
                  }}
                >
                  Sign In
                </Link>
              </div>
              <div style={{ marginTop: 10 }}>
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
          </>
        )}
      </div>
    </div>
  );
}
