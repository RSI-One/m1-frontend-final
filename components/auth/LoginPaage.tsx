import React, { useState, FormEvent } from "react";
import { apiPost, setAccessToken, ApiError } from "@/lib/api/client";

interface LoginPageProps {
  onSuccess?: (result: unknown) => void;
  redirectTo?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  pin?: string;
  form?: string;
}

interface LoginPinResponse {
  session_id: string;
  requires_pin: boolean;
  pin_length: number;
}

interface VerifyPinResult {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  access_token?: string; // backend may set httpOnly cookie instead; kept optional
  [key: string]: unknown;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M6.6 6.7C4.2 8.2 2 12 2 12s3.6 7 10 7c1.8 0 3.4-.4 4.7-1.1M17.6 17.4C19.6 15.8 22 12 22 12s-1-2-2.9-3.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Step = "credentials" | "pin";

export default function LoginPage({ onSuccess, redirectTo = "/dashboard" }: LoginPageProps) {
  const [step, setStep] = useState<Step>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pinLength, setPinLength] = useState(6);

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  function validateCredentials(): FormErrors {
    const next: FormErrors = {};
    if (!email.trim()) {
      next.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Enter your password.";
    }
    return next;
  }

  function validatePin(): FormErrors {
    const next: FormErrors = {};
    if (!pin.trim()) {
      next.pin = "Enter the code sent to your email.";
    } else if (pin.trim().length !== pinLength) {
      next.pin = `Enter the ${pinLength}-digit code.`;
    }
    return next;
  }

  async function handleCredentialsSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateCredentials();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const result = await apiPost<LoginPinResponse>(
        "/auth/login",
        { email: email.trim(), password },
        { auth: false }
      );

      setSessionId(result.session_id);
      setPinLength(result.pin_length || 6);

      if (result.requires_pin) {
        setStep("pin");
      } else {
        // fallback: some flows might skip PIN — treat as done
        finishLogin(result as unknown as VerifyPinResult);
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Invalid email or password.";
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePinSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validatePin();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (!sessionId) {
      setErrors({ form: "Session expired. Please log in again." });
      setStep("credentials");
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const result = await apiPost<VerifyPinResult>(
        "/auth/login/verify-pin",
        { session_id: sessionId, pin: pin.trim() },
        { auth: false }
      );
      finishLogin(result);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Invalid or expired code.";
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  function finishLogin(result: VerifyPinResult) {
    if (result?.access_token) {
      setAccessToken(result.access_token);
    }
    if (onSuccess) {
      onSuccess(result);
    } else {
      window.location.href = redirectTo;
    }
  }

  async function handleResendPin() {
    if (!sessionId || resending) return;
    setResending(true);
    setResendMsg(null);
    try {
      await apiPost(
        "/auth/login/resend-pin",
        { session_id: sessionId },
        { auth: false }
      );
      setResendMsg("Code resent. Check your email.");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not resend code.";
      setResendMsg(message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="m1-login">
      <div className="m1-login__glow" aria-hidden="true" />

      <div className="m1-login__card">
        <div className="m1-login__heading">
          <h1>Welcome back</h1>
          <p>{step === "credentials" ? "Sign in" : "Enter verification code"}</p>
        </div>

        {step === "credentials" && (
          <form className="m1-login__form" onSubmit={handleCredentialsSubmit} noValidate>
            {errors.form && (
              <div className="m1-login__alert" role="alert">
                {errors.form}
              </div>
            )}

            <div className="m1-login__field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={errors.email ? "has-error" : ""}
              />
              {errors.email && (
                <span className="m1-login__field-error" id="email-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="m1-login__field">
              <label htmlFor="password">Password</label>
              <div className="m1-login__password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={errors.password ? "has-error" : ""}
                />
                <button
                  type="button"
                  className="m1-login__eye-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && (
                <span className="m1-login__field-error" id="password-error">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="m1-login__row">
              <label className="m1-login__checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <a href="/forgot-password" className="m1-login__link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="m1-login__submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="m1-login__spinner" aria-hidden="true" /> : "Sign in"}
            </button>
          </form>
        )}

        {step === "pin" && (
          <form className="m1-login__form" onSubmit={handlePinSubmit} noValidate>
            {errors.form && (
              <div className="m1-login__alert" role="alert">
                {errors.form}
              </div>
            )}

            <div className="m1-login__field">
              <label htmlFor="pin">Verification code</label>
              <input
                id="pin"
                name="pin"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={`Enter the ${pinLength}-digit code`}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={pinLength}
                aria-invalid={!!errors.pin}
                aria-describedby={errors.pin ? "pin-error" : undefined}
                className={errors.pin ? "has-error" : ""}
              />
              {errors.pin && (
                <span className="m1-login__field-error" id="pin-error">
                  {errors.pin}
                </span>
              )}
            </div>

            <div className="m1-login__row">
              <button
                type="button"
                className="m1-login__link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={() => {
                  setStep("credentials");
                  setPin("");
                  setErrors({});
                }}
              >
                ← Back
              </button>

              <button
                type="button"
                className="m1-login__link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={handleResendPin}
                disabled={resending}
              >
                {resending ? "Resending..." : "Resend code"}
              </button>
            </div>

            {resendMsg && (
              <span className="m1-login__field-error" style={{ color: "var(--m1-cream)" }}>
                {resendMsg}
              </span>
            )}

            <button type="submit" className="m1-login__submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="m1-login__spinner" aria-hidden="true" /> : "Verify & Sign in"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600;700&display=swap');

        .m1-login {
          --m1-bg: #0a0c11;
          --m1-bg-deep: #050609;
          --m1-surface: rgba(255, 255, 255, 0.035);
          --m1-border: rgba(255, 255, 255, 0.09);
          --m1-cream: #eadfc7;
          --m1-cream-strong: #f1e8d4;
          --m1-gold: #c9a866;
          --m1-white: #f4f2ec;
          --m1-muted: #9a988f;
          --m1-danger: #e5a3a3;
          --m1-danger-bg: rgba(197, 90, 90, 0.12);
          --m1-danger-border: rgba(197, 90, 90, 0.35);

          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background: var(--m1-bg);
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          overflow: hidden;
          box-sizing: border-box;
        }

        .m1-login *,
        .m1-login *::before,
        .m1-login *::after {
          box-sizing: border-box;
        }

        .m1-login__glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 640px 420px at 50% 8%, rgba(201, 168, 102, 0.10), transparent 60%),
            radial-gradient(ellipse 900px 600px at 85% 95%, rgba(234, 223, 199, 0.05), transparent 60%),
            radial-gradient(ellipse 900px 600px at 15% 95%, rgba(255, 255, 255, 0.035), transparent 60%);
        }

        .m1-login__card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 428px;
          padding: 40px 36px 36px;
          background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02));
          border: 1px solid var(--m1-border);
          border-radius: 20px;
          box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.02) inset;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .m1-login__heading {
          text-align: center;
          margin-bottom: 30px;
        }

        .m1-login__heading h1 {
          margin: 0 0 8px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-weight: 600;
          font-size: 32px;
          line-height: 1.15;
          color: var(--m1-white);
        }

        .m1-login__heading p {
          margin: 0;
          font-size: 14px;
          color: var(--m1-muted);
        }

        .m1-login__form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .m1-login__alert {
          font-size: 13px;
          color: var(--m1-danger);
          background: var(--m1-danger-bg);
          border: 1px solid var(--m1-danger-border);
          border-radius: 10px;
          padding: 10px 14px;
        }

        .m1-login__field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .m1-login__field label {
          font-size: 12.5px;
          font-weight: 500;
          color: #d8d5ca;
        }

        .m1-login__field input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--m1-border);
          border-radius: 10px;
          color: var(--m1-white);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .m1-login__field input::placeholder {
          color: #6b6a63;
        }

        .m1-login__field input:focus {
          border-color: var(--m1-gold);
          background: rgba(255, 255, 255, 0.06);
        }

        .m1-login__field input.has-error {
          border-color: var(--m1-danger-border);
        }

        .m1-login__field-error {
          font-size: 12px;
          color: var(--m1-danger);
        }

        .m1-login__password-wrap {
          position: relative;
        }

        .m1-login__password-wrap input {
          padding-right: 42px;
        }

        .m1-login__eye-toggle {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 7px;
          color: var(--m1-muted);
          cursor: pointer;
          transition: color 0.15s ease, background 0.15s ease;
        }

        .m1-login__eye-toggle:hover {
          color: var(--m1-cream);
          background: rgba(255, 255, 255, 0.06);
        }

        .m1-login__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -4px;
        }

        .m1-login__checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #c8c6bd;
          cursor: pointer;
          user-select: none;
        }

        .m1-login__checkbox input {
          width: 15px;
          height: 15px;
          accent-color: var(--m1-gold);
          cursor: pointer;
        }

        .m1-login__link {
          font-size: 13px;
          color: var(--m1-cream);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.15s ease;
        }

        .m1-login__link:hover {
          border-bottom-color: var(--m1-cream);
        }

        .m1-login__submit {
          margin-top: 4px;
          height: 48px;
          width: 100%;
          border: none;
          border-radius: 10px;
          background: linear-gradient(180deg, var(--m1-cream-strong), var(--m1-cream));
          color: #14120d;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
          box-shadow: 0 10px 24px -8px rgba(234, 223, 199, 0.35);
        }

        .m1-login__submit:hover:not(:disabled) {
          filter: brightness(1.04);
          transform: translateY(-1px);
          box-shadow: 0 14px 28px -8px rgba(234, 223, 199, 0.45);
        }

        .m1-login__submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .m1-login__submit:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .m1-login__spinner {
          width: 17px;
          height: 17px;
          border-radius: 50%;
          border: 2px solid rgba(20, 18, 13, 0.25);
          border-top-color: #14120d;
          animation: m1-spin 0.7s linear infinite;
        }

        @keyframes m1-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .m1-login__card {
            padding: 32px 22px 28px;
            border-radius: 16px;
          }
          .m1-login__heading h1 {
            font-size: 27px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .m1-login__submit,
          .m1-login__spinner {
            transition: none;
            animation-duration: 0.001ms;
          }
        }
      `}</style>
    </div>
  );
}