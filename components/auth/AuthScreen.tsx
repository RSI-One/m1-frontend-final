"use client";

import { useState, useRef } from "react";
import * as authApi from "@/lib/api/auth";

type AccessScreen = "login" | "verify" | "complete" | "reset" | "reset-checking" | "reset-sent";
type RegisterScreen = "form" | "verify" | "complete";

const cut = "[clip-path:polygon(14px_0,100%_0,calc(100%-14px)_100%,0_100%)]";
const hoverFx = "hover:scale-[1.02] active:scale-[0.98] transition-transform";

const COUNTRIES = [
  { code: "AF", name: "Afghanistan", dial: "+93" },
  { code: "AL", name: "Albania", dial: "+355" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "IR", name: "Iran", dial: "+98" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "RE", name: "Réunion", dial: "+262" },
  { code: "RO", name: "Romania", dial: "+40" },
  { code: "RU", name: "Russia", dial: "+7" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "TR", name: "Turkey", dial: "+90" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "US", name: "United States", dial: "+1" },
];

const ASSET_OPTIONS = ["1-2", "3-5", "6-10", "11-20", "21-50", "50+"];
const REASON_OPTIONS = ["Marketplace", "Management", "Both"];

const steps = [
  { key: "fullName", type: "text", label: "1. What's your full name?", placeholder: "e.g. John Carter" },
  { key: "company", type: "text", label: "2. Company or organisation?", placeholder: "Company name", skippable: true },
  { key: "email", type: "text", label: "3. Your email address?", placeholder: "you@business.com" },
  { key: "phone", type: "phone", label: "4. Phone number?" },
  { key: "country", type: "country", label: "5. Where are you based?" },
  { key: "assets", type: "select", label: "6. How many assets do you own?" },
  { key: "reason", type: "toggle", label: "7. Primary reason for joining?" },
  {
    key: "password",
    type: "password",
    label: "8. Create a password",
    hint: "9+ characters, including one capital letter, one number and one special character.",
  },
  { key: "confirmPassword", type: "password", label: "9. Confirm your password" },
] as const;

function deriveUsername(email: string): string {
  const base = email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "";
  return base.length >= 3 ? base.slice(0, 50) : `user${Date.now()}`;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as any;
  return (
    anyErr?.response?.data?.detail ||
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    fallback
  );
}

function UnderlineInput({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-b border-white/15 bg-transparent pb-2 text-sm text-white tracking-wide placeholder:text-gray-600 focus:border-white/50 focus:outline-none"
    />
  );
}

function OtpInput({
  length,
  values,
  onChange,
}: {
  length: number;
  values: string[];
  onChange: (i: number, v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={values[i] || ""}
          maxLength={1}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, "");
            onChange(i, v);
            if (v && refs.current[i + 1]) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !values[i] && refs.current[i - 1]) refs.current[i - 1]?.focus();
          }}
          className="h-11 w-11 rounded-md border border-white/15 bg-transparent text-center text-lg text-white focus:border-white/50 focus:outline-none"
        />
      ))}
    </div>
  );
}

function BackPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15 text-gray-400 hover:text-white"
    >
      ←
    </button>
  );
}

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mb-4 text-xs text-red-400">{message}</p>;
}

interface AuthScreenProps {
  onAuthSuccess?: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [tab, setTab] = useState<"access" | "register">("access");

  // Access flow
  const [accessScreen, setAccessScreen] = useState<AccessScreen>("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [pin, setPin] = useState<string[]>(Array(6).fill(""));
  const [pinSessionId, setPinSessionId] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [resetData, setResetData] = useState({ email: "", dial: "+92", phone: "" });
  const [resetDialOpen, setResetDialOpen] = useState(false);
  const [resetDialQuery, setResetDialQuery] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Register flow
  const [registerScreen, setRegisterScreen] = useState<RegisterScreen>("form");
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({ phoneDial: "+92" });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [regCode, setRegCode] = useState<string[]>(Array(6).fill(""));
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [regResendLoading, setRegResendLoading] = useState(false);
  const [regResendMessage, setRegResendMessage] = useState<string | null>(null);

  const [countryQuery, setCountryQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [dialQuery, setDialQuery] = useState("");
  const [dialOpen, setDialOpen] = useState(false);

  const canAuthenticate = loginData.email.trim().length > 0 && loginData.password.trim().length > 0;
  const currentStep = steps[step];
  const currentValue = formData[currentStep?.key] ?? "";
  const isLastStep = step === steps.length - 1;

  const canContinue = (() => {
    switch (currentStep.type) {
      case "text":
        return currentValue.trim().length > 0;
      case "phone":
        return !!formData.phoneDial && (formData.phone ?? "").trim().length > 0;
      case "country":
        return (formData.country ?? "").trim().length > 0;
      case "select":
        return (formData.assets ?? "").trim().length > 0;
      case "toggle":
        return (formData.reason ?? "").trim().length > 0;
      case "password":
        if (isLastStep) return currentValue.length > 0 && currentValue === formData.password;
        return currentValue.length > 0;
      default:
        return false;
    }
  })();

  const handleChange = (value: string) => setFormData((p) => ({ ...p, [currentStep.key]: value }));

  // ---------- LOGIN: step 1 (password) ----------
  const handleLoginSubmit = async () => {
    if (!canAuthenticate || loginLoading) return;
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await authApi.login(loginData.email.trim(), loginData.password);
      console.log("LOGIN RESPONSE >>>", res);

      
      const payload = (res as any)?.data ?? res;
      const sessionId = payload?.session_id ?? null;
      const pinLength = payload?.pin_length || 6;

      if (!sessionId) {
        
        setLoginError("Could not start verification. Please try again.");
        return;
      }

      setPinSessionId(sessionId);
      setPin(Array(pinLength).fill(""));
      setPinError(null);
      setResendMessage(null);
      setAccessScreen("verify");
    } catch (err) {
      setLoginError(extractErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoginLoading(false);
    }
  };

  // ---------- LOGIN: step 2 (PIN) ----------
  const handlePinSubmit = async () => {
    if (!pinSessionId || pinLoading) return;
    const code = pin.join("");
    if (code.length < pin.length) return;
    setPinError(null);
    setPinLoading(true);
    try {
      await authApi.verifyLoginPin(pinSessionId, code);
      setAccessScreen("complete");
    } catch (err) {
      setPinError(extractErrorMessage(err, "Incorrect or expired code"));
    } finally {
      setPinLoading(false);
    }
  };

  const handleResendPin = async () => {
    if (!pinSessionId || resendLoading) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      await authApi.resendLoginPin(pinSessionId);
      setResendMessage("A new code has been sent to your email.");
    } catch (err) {
      setResendMessage(extractErrorMessage(err, "Could not resend code, try again"));
    } finally {
      setResendLoading(false);
    }
  };

  // ---------- FORGOT PASSWORD ----------
  const handleForgotPasswordSubmit = async () => {
    if (!resetData.email || !resetData.phone || resetLoading) return;
    setResetError(null);
    setResetLoading(true);
    setAccessScreen("reset-checking");
    try {
      await authApi.forgotPassword(resetData.email.trim());
    } catch {
      // Deliberately swallow errors here (including "no account found") so
      // the UI never reveals whether an email exists — matches the
      // "If your details match our records..." copy on the next screen.
    } finally {
      setResetLoading(false);
      setAccessScreen("reset-sent");
    }
  };

  // ---------- REGISTER: submit form -> signup ----------
  const handleRegisterSubmit = async () => {
    if (!canContinue || registerLoading) return;
    if (!isLastStep) {
      setStep(step + 1);
      return;
    }

    setRegisterError(null);
    setRegisterLoading(true);
    try {
      const email = (formData.email ?? "").trim();
      await authApi.signup({
        username: deriveUsername(email),
        email,
        password: formData.password,
      });
      // NOTE: fullName, company, phone, country, assets, reason are collected
      // above but not sent here — /auth/signup only accepts
      // username/email/password today. Wire these into a profile-update
      // call once a PATCH /users/me/profile endpoint exists.
      setVerifyError(null);
      setRegResendMessage(null);
      setRegisterScreen("verify");
    } catch (err) {
      setRegisterError(extractErrorMessage(err, "Could not create account"));
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSkip = () => setStep(step + 1);
  const handleBack = () => step > 0 && setStep(step - 1);

  // ---------- REGISTER: verify email code ----------
  const handleVerifyEmailSubmit = async () => {
    if (verifyLoading) return;
    const code = regCode.join("");
    if (code.length < 6) return;
    setVerifyError(null);
    setVerifyLoading(true);
    try {
      await authApi.verifyEmail(code);
      setRegisterScreen("complete");
    } catch (err) {
      setVerifyError(extractErrorMessage(err, "Incorrect or expired code"));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendRegisterCode = async () => {
    if (regResendLoading) return;
    const email = (formData.email ?? "").trim();
    if (!email) return;
    setRegResendLoading(true);
    setRegResendMessage(null);
    try {
      await authApi.resendVerification(email);
      setRegResendMessage("A new code has been sent to your email.");
    } catch (err) {
      setRegResendMessage(extractErrorMessage(err, "Could not resend code, try again"));
    } finally {
      setRegResendLoading(false);
    }
  };

  const filteredCountries = COUNTRIES.filter((c) => c.name.toLowerCase().includes(countryQuery.toLowerCase()));
  const filteredDials = COUNTRIES.filter(
    (c) => c.code.toLowerCase().includes(dialQuery.toLowerCase()) || c.dial.includes(dialQuery)
  );
  const filteredResetDials = COUNTRIES.filter(
    (c) => c.code.toLowerCase().includes(resetDialQuery.toLowerCase()) || c.dial.includes(resetDialQuery)
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0b0d] flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20px_30px,#ffffff33,transparent),radial-gradient(1px_1px_at_90px_120px,#ffffff22,transparent),radial-gradient(1px_1px_at_150px_60px,#ffffff2b,transparent),radial-gradient(1px_1px_at_220px_180px,#ffffff22,transparent),radial-gradient(1px_1px_at_300px_40px,#ffffff33,transparent)] bg-repeat [background-size:320px_320px]" />

      <div className="relative z-10 flex w-[92%] max-w-4xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a1f4d] to-[#1b3f7a] md:flex">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/auth-preview.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>

        <div className="flex max-h-[85vh] w-full flex-col overflow-y-auto bg-[#3a3d42] px-8 py-7 md:w-1/2">
          <div className="mb-4 flex justify-end text-[10px] uppercase tracking-widest text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Secure session
            </span>
          </div>

          <div className="mb-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="M1" className="h-9 w-auto object-contain" />
          </div>

          <div className="mb-7 flex text-xs font-medium uppercase tracking-widest">
            <button
              onClick={() => setTab("access")}
              className={`flex-1 border-b py-2.5 transition ${
                tab === "access" ? `border-white bg-white/10 text-white ${cut}` : "border-white/10 text-gray-400 hover:text-gray-200"
              }`}
            >
              Access
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 border-b py-2.5 transition ${
                tab === "register" ? `border-white bg-white/10 text-white ${cut}` : "border-white/10 text-gray-400 hover:text-gray-200"
              }`}
            >
              Register
            </button>
          </div>

          {/* ================= ACCESS TAB ================= */}
          {tab === "access" && accessScreen === "login" && (
            <>
              <button className={`mb-3 flex items-center justify-center gap-2 bg-white py-2.5 text-sm font-medium text-black ${cut} ${hoverFx}`}>
                <GoogleIcon />
                Continue with Google
              </button>
              <button className={`mb-6 flex items-center justify-center gap-2 bg-[#1a1a1a] py-2.5 text-sm font-medium text-white ${cut} ${hoverFx}`}>
                <AppleIcon />
                Continue with Apple
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-400">Email address</label>
              <div className="mb-5">
                <UnderlineInput
                  value={loginData.email}
                  onChange={(v) => setLoginData((p) => ({ ...p, email: v }))}
                  placeholder="youremail.com"
                />
              </div>

              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-400">Password</label>
              <div className="mb-2">
                <UnderlineInput
                  type="password"
                  value={loginData.password}
                  onChange={(v) => setLoginData((p) => ({ ...p, password: v }))}
                  placeholder="••••••••••••"
                />
              </div>

              <div className="mb-5 flex justify-end">
                <button
                  onClick={() => setAccessScreen("reset")}
                  className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-200"
                >
                  Forgot credentials
                </button>
              </div>

              <ErrorText message={loginError} />

              <button
                disabled={!canAuthenticate || loginLoading}
                onClick={handleLoginSubmit}
                className={`py-3 text-sm font-medium uppercase tracking-widest transition ${cut} ${
                  canAuthenticate && !loginLoading
                    ? "bg-white text-black hover:bg-gray-100"
                    : "cursor-not-allowed bg-[repeating-linear-gradient(135deg,#3a3a3a,#3a3a3a_6px,#2f2f2f_6px,#2f2f2f_12px)] text-gray-400"
                }`}
              >
                {loginLoading ? "Authenticating…" : "Authenticate"}
              </button>

              <p className="mt-6 text-center text-xs text-gray-400">
                New here?{" "}
                <button onClick={() => setTab("register")} className="font-medium text-white underline">
                  Create account
                </button>
              </p>
            </>
          )}

          {tab === "access" && accessScreen === "verify" && (
            <>
              <div className="mb-6 flex items-center gap-3">
                <BackPill onClick={() => setAccessScreen("login")} />
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Verify Identity</h2>
                  <p className="text-xs text-gray-400">Sent · {loginData.email}</p>
                </div>
              </div>
              <p className="mb-4 text-center text-sm italic text-gray-300">
                Enter the {pin.length}-digit code sent to your email.
              </p>
              <div className="mb-6 flex justify-center">
                <OtpInput
                  length={pin.length}
                  values={pin}
                  onChange={(i, v) => setPin((p) => { const n = [...p]; n[i] = v; return n; })}
                />
              </div>

              <ErrorText message={pinError} />

              <button
                disabled={pin.some((d) => !d) || pinLoading}
                onClick={handlePinSubmit}
                className={`w-full py-3 text-sm font-medium uppercase tracking-widest transition ${cut} ${
                  pin.every((d) => d) && !pinLoading
                    ? "bg-white text-black hover:bg-gray-100"
                    : "cursor-not-allowed bg-[repeating-linear-gradient(135deg,#3a3a3a,#3a3a3a_6px,#2f2f2f_6px,#2f2f2f_12px)] text-gray-400"
                }`}
              >
                {pinLoading ? "Verifying…" : "Authenticate"}
              </button>
              <div className="mt-5 flex flex-col items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
                <button onClick={handleResendPin} disabled={resendLoading} className="hover:text-gray-200 disabled:opacity-50">
                  {resendLoading ? "Sending…" : "Send to my email"}
                </button>
                {resendMessage && <p className="normal-case text-gray-300">{resendMessage}</p>}
              </div>
            </>
          )}

          {tab === "access" && accessScreen === "complete" && (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="mb-4 text-xs uppercase tracking-widest text-gray-400">Authentication complete</p>
              <div className="mb-4 text-3xl text-white">✓</div>
              <p className="mb-6 text-sm uppercase tracking-widest text-gray-300">Welcome back to M1</p>
              <button
                onClick={() => onAuthSuccess?.()}
                className={`px-8 py-3 text-sm font-medium uppercase tracking-widest text-black bg-white hover:bg-gray-100 transition ${cut} ${hoverFx}`}
              >
                Enter marketplace
              </button>
            </div>
          )}

          {tab === "access" && accessScreen === "reset" && (
            <>
              <div className="mb-6 flex items-center gap-3">
                <BackPill onClick={() => setAccessScreen("login")} />
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Reset Password</h2>
                  <p className="text-xs text-gray-400">Verify your identity</p>
                </div>
              </div>
              <p className="mb-5 text-xs italic text-gray-300">Enter the email and phone number on your account.</p>

              <div className="mb-5">
                <UnderlineInput
                  value={resetData.email}
                  onChange={(v) => setResetData((p) => ({ ...p, email: v }))}
                  placeholder="Your full email address"
                />
              </div>

              <div className="relative mb-6 flex gap-3">
                <button
                  onClick={() => setResetDialOpen(!resetDialOpen)}
                  className="border-b border-white/15 pb-2 text-sm text-white"
                >
                  {resetData.dial}
                </button>
                <div className="flex-1">
                  <UnderlineInput
                    value={resetData.phone}
                    onChange={(v) => setResetData((p) => ({ ...p, phone: v }))}
                    placeholder="Phone number"
                  />
                </div>
                {resetDialOpen && (
                  <div className="absolute left-0 top-10 z-20 max-h-40 w-48 overflow-y-auto rounded-md border border-white/10 bg-[#1a1a1a] shadow-xl">
                    <input
                      autoFocus
                      value={resetDialQuery}
                      onChange={(e) => setResetDialQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full border-b border-white/10 bg-transparent px-2 py-1.5 text-xs text-white focus:outline-none"
                    />
                    {filteredResetDials.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setResetData((p) => ({ ...p, dial: c.dial }));
                          setResetDialOpen(false);
                          setResetDialQuery("");
                        }}
                        className="flex w-full justify-between px-2 py-1.5 text-left text-xs text-gray-300 hover:bg-white/10"
                      >
                        <span>{c.code}</span>
                        <span>{c.dial}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ErrorText message={resetError} />

              <button
                disabled={!resetData.email || !resetData.phone || resetLoading}
                onClick={handleForgotPasswordSubmit}
                className={`py-3 text-sm font-medium uppercase tracking-widest transition ${cut} ${
                  resetData.email && resetData.phone && !resetLoading
                    ? "bg-white text-black hover:bg-gray-100"
                    : "cursor-not-allowed bg-[repeating-linear-gradient(135deg,#3a3a3a,#3a3a3a_6px,#2f2f2f_6px,#2f2f2f_12px)] text-gray-400"
                }`}
              >
                Send reset link
              </button>
            </>
          )}

          {tab === "access" && accessScreen === "reset-checking" && (
            <button disabled className={`py-3 text-sm font-medium uppercase tracking-widest bg-[repeating-linear-gradient(135deg,#3a3a3a,#3a3a3a_6px,#2f2f2f_6px,#2f2f2f_12px)] text-gray-400 ${cut}`}>
              — Checking —
            </button>
          )}

          {tab === "access" && accessScreen === "reset-sent" && (
            <div className="flex flex-col items-center py-6 text-center">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Check your email</h2>
              <p className="mb-4 text-xs italic text-gray-300">
                If your details match our records, a link to reset your password has been sent to
                <br />
                {resetData.email}
              </p>
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white">✓</div>
              <button onClick={() => setAccessScreen("login")} className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-200">
                ← Back to sign in
              </button>
            </div>
          )}

          {/* ================= REGISTER TAB ================= */}
          {tab === "register" && registerScreen === "form" && (
            <>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white">Create account</h2>
              <p className="mb-5 text-xs text-gray-400">Quick sign up or register manually below</p>

              <button className={`mb-3 flex items-center justify-center gap-2 bg-white py-2.5 text-sm font-medium text-black ${cut} ${hoverFx}`}>
                <GoogleIcon />
                Sign up with Google
              </button>
              <button className={`mb-6 flex items-center justify-center gap-2 bg-[#1a1a1a] py-2.5 text-sm font-medium text-white ${cut} ${hoverFx}`}>
                <AppleIcon />
                Sign up with Apple
              </button>

              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Or fill in details</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="mb-6 flex gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition ${i <= step ? "bg-white" : "bg-white/10"}`} />
                ))}
              </div>

              <label className="mb-3 block text-sm italic text-gray-300">{currentStep.label}</label>

              {currentStep.type === "text" && (
                <div className="mb-2">
                  <UnderlineInput value={currentValue} onChange={handleChange} placeholder={currentStep.placeholder} />
                </div>
              )}

              {currentStep.type === "password" && (
                <div className="mb-2">
                  <UnderlineInput type="password" value={currentValue} onChange={handleChange} placeholder="••••••••••••" />
                  {"hint" in currentStep && currentStep.hint && (
                    <p className="mt-2 text-[11px] leading-snug text-gray-400">{currentStep.hint}</p>
                  )}
                </div>
              )}

              {currentStep.type === "phone" && (
                <div className="relative mb-2 flex gap-3">
                  <button
                    onClick={() => setDialOpen(!dialOpen)}
                    className="border-b border-white/15 pb-2 text-sm text-white"
                  >
                    {formData.phoneDial || "+92"}
                  </button>
                  <div className="flex-1">
                    <UnderlineInput
                      value={formData.phone ?? ""}
                      onChange={(v) => setFormData((p) => ({ ...p, phone: v }))}
                      placeholder="Phone number"
                    />
                  </div>
                  {dialOpen && (
                    <div className="absolute left-0 top-10 z-20 max-h-40 w-48 overflow-y-auto rounded-md border border-white/10 bg-[#1a1a1a] shadow-xl">
                      <input
                        autoFocus
                        value={dialQuery}
                        onChange={(e) => setDialQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full border-b border-white/10 bg-transparent px-2 py-1.5 text-xs text-white focus:outline-none"
                      />
                      {filteredDials.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setFormData((p) => ({ ...p, phoneDial: c.dial })); setDialOpen(false); setDialQuery(""); }}
                          className="flex w-full justify-between px-2 py-1.5 text-left text-xs text-gray-300 hover:bg-white/10"
                        >
                          <span>{c.code}</span>
                          <span>{c.dial}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep.type === "country" && (
                <div className="relative mb-2">
                  <UnderlineInput
                    value={countryOpen ? countryQuery : formData.country ?? ""}
                    onChange={(v) => { setCountryQuery(v); setCountryOpen(true); }}
                    placeholder="Start typing..."
                  />
                  {countryOpen && (
                    <div className="absolute left-0 top-10 z-20 max-h-40 w-full overflow-y-auto rounded-md border border-white/10 bg-[#1a1a1a] shadow-xl">
                      {filteredCountries.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setFormData((p) => ({ ...p, country: c.name })); setCountryOpen(false); setCountryQuery(""); }}
                          className="flex w-full justify-between px-3 py-1.5 text-left text-xs text-gray-300 hover:bg-white/10"
                        >
                          <span>{c.code}</span>
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep.type === "select" && (
                <select
                  value={formData.assets ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, assets: e.target.value }))}
                  className="mb-2 w-full border-b border-white/15 bg-transparent pb-2 text-sm text-white focus:outline-none"
                >
                  <option value="" className="bg-[#1a1a1a]">Select one…</option>
                  {ASSET_OPTIONS.map((o) => (
                    <option key={o} value={o} className="bg-[#1a1a1a]">{o}</option>
                  ))}
                </select>
              )}

              {currentStep.type === "toggle" && (
                <div className="mb-2 flex gap-2">
                  {REASON_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setFormData((p) => ({ ...p, reason: r }))}
                      className={`flex-1 rounded-md border py-2 text-[10px] uppercase tracking-widest transition ${
                        formData.reason === r ? "border-white bg-white text-black" : "border-white/15 text-gray-300 hover:text-gray-100"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              <ErrorText message={isLastStep ? registerError : null} />

              <div className="mt-4 flex gap-2">
                {step > 0 && (
                  <button onClick={handleBack} className={`flex w-12 items-center justify-center bg-[#1a1a1a] py-2.5 text-sm text-white ${cut}`}>
                    ←
                  </button>
                )}
                <button
                  onClick={handleRegisterSubmit}
                  disabled={!canContinue || registerLoading}
                  className={`flex flex-1 items-center justify-center py-2.5 text-sm font-medium uppercase tracking-widest transition ${cut} ${
                    canContinue && !registerLoading
                      ? "bg-white text-black hover:bg-gray-100"
                      : "cursor-not-allowed bg-[repeating-linear-gradient(135deg,#3a3a3a,#3a3a3a_6px,#2f2f2f_6px,#2f2f2f_12px)] text-gray-400"
                  }`}
                >
                  {isLastStep ? (registerLoading ? "Submitting…" : "Submit & Verify") : "Continue →"}
                </button>
              </div>

              {"skippable" in currentStep && currentStep.skippable && (
                <button onClick={handleSkip} className="mt-3 block w-full text-center text-[10px] uppercase tracking-widest text-gray-400 underline">
                  Skip
                </button>
              )}

              <p className="mt-6 text-center text-xs text-gray-400">
                Have an account?{" "}
                <button onClick={() => setTab("access")} className="font-medium text-white underline">
                  Sign in
                </button>
              </p>
            </>
          )}

          {tab === "register" && registerScreen === "verify" && (
            <>
              <div className="mb-6 flex items-center gap-3">
                <BackPill onClick={() => setRegisterScreen("form")} />
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Verify Identity</h2>
                  <p className="text-xs text-gray-400">Sent · {formData.email || "your@email.com"}</p>
                </div>
              </div>
              <p className="mb-4 text-center text-sm italic text-gray-300">Enter the 6-digit code sent to your address.</p>
              <div className="mb-6 flex justify-center">
                <OtpInput length={6} values={regCode} onChange={(i, v) => setRegCode((p) => { const n = [...p]; n[i] = v; return n; })} />
              </div>

              <ErrorText message={verifyError} />

              <button
                disabled={regCode.some((d) => !d) || verifyLoading}
                onClick={handleVerifyEmailSubmit}
                className={`w-full py-3 text-sm font-medium uppercase tracking-widest transition ${cut} ${
                  regCode.every((d) => d) && !verifyLoading
                    ? "bg-white text-black hover:bg-gray-100"
                    : "cursor-not-allowed bg-[repeating-linear-gradient(135deg,#3a3a3a,#3a3a3a_6px,#2f2f2f_6px,#2f2f2f_12px)] text-gray-400"
                }`}
              >
                {verifyLoading ? "Verifying…" : "Complete registration"}
              </button>

              <div className="mt-4 flex flex-col items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
                <button onClick={handleResendRegisterCode} disabled={regResendLoading} className="hover:text-gray-200 disabled:opacity-50">
                  {regResendLoading ? "Sending…" : "Resend code"}
                </button>
                {regResendMessage && <p className="normal-case text-gray-300">{regResendMessage}</p>}
              </div>
            </>
          )}

          {tab === "register" && registerScreen === "complete" && (
            <div className="flex flex-col items-center py-8 text-center">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white">Registration complete</h2>
              <p className="mb-1 text-xs italic text-gray-300">Your M1 membership is now active.</p>
              <p className="mb-4 text-sm text-white">Welcome aboard.</p>
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white">✓</div>
              <button
                onClick={() => onAuthSuccess?.()}
                className={`px-8 py-3 text-sm font-medium uppercase tracking-widest text-black bg-white hover:bg-gray-100 transition ${cut} ${hoverFx}`}
              >
                Enter marketplace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 34.9 27 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.8l6.6 5.6C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 384 512" fill="white">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  );
}