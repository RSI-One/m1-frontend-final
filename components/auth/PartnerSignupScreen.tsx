"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & { query?: Record<string, string | undefined> } = {}
): Promise<T> {
  const { query, ...init } = options;
  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    credentials: "include", // backend sets httpOnly session/refresh cookies
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const detail =
      body && typeof body === "object" && "detail" in (body as Record<string, unknown>)
        ? (body as { detail: unknown }).detail
        : body;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail) && detail.length > 0 && typeof detail[0]?.msg === "string"
        ? detail[0].msg
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, detail);
  }

  return body as T;
}

// ---- Types matching the OpenAPI schema (trimmed to what we use) ----------
type PublicSignupRole = "general" | "seller";

interface UserCreatePayload {
  email: string;
  password: string;
  role: PublicSignupRole;
  username?: string;
  full_name?: string;
  company_name?: string;
  phone_number?: string;
  location?: string;
  country?: string;
}

interface UserReadResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  organization_id: string | null;
  seller_mode_active: boolean;
  is_flagged: boolean;
  created_at: string;
}

// ---- Endpoint calls ---------------------------------------------------
function signup(payload: UserCreatePayload) {
  return apiFetch<UserReadResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function verifyEmail(token: string) {
  return apiFetch<UserReadResponse>("/auth/verify-email", {
    method: "POST",
    query: { token },
  });
}

function resendVerification() {
  return apiFetch<void>("/auth/resend-verification", { method: "POST" });
}

function addTeamMember(
  organizationId: string,
  member: { name: string; email: string; phone_number?: string }
) {
  return apiFetch(`/partner/org/${organizationId}/team`, {
    method: "POST",
    body: JSON.stringify(member),
  });
}

// ---------------------------------------------------------------------------
// UI (unchanged below except for submit wiring)
// ---------------------------------------------------------------------------

type Screen = "form" | "verify" | "complete";

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

type Member = { name: string; dial: string; phone: string; email: string };

const steps = [
  { key: "companyName", type: "text", label: "1. Company name", placeholder: "e.g. Acme Realty Group" },
  { key: "location", type: "text", label: "2. Location", placeholder: "City, Country" },
  { key: "founderName", type: "text", label: "3. Founder name", placeholder: "e.g. John Carter" },
  { key: "email", type: "text", label: "4. Company email address", placeholder: "you@company.com" },
  { key: "website", type: "text", label: "5. Website", placeholder: "www.company.com", skippable: true },
  { key: "phone", type: "phone", label: "6. Admin phone number", hint: "This should be the Super Admin's phone number." },
  { key: "members", type: "members", label: "7. Add your team members", hint: "Optional — you can add more members later from My Team.", skippable: true },
  {
    key: "password",
    type: "password",
    label: "8. Create a password",
    hint: "9+ characters, including one capital letter, one number and one special character.",
  },
  { key: "confirmPassword", type: "password", label: "9. Confirm your password" },
] as const;

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
      className="w-full border-b border-black/15 bg-transparent pb-2 text-sm text-black tracking-wide placeholder:text-gray-400 focus:border-black/50 focus:outline-none"
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
          className="h-11 w-11 rounded-md border border-black/15 bg-transparent text-center text-lg text-black focus:border-black/50 focus:outline-none"
        />
      ))}
    </div>
  );
}

function BackPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-black/15 text-gray-500 hover:text-black"
    >
      ←
    </button>
  );
}

export default function PartnerSignupScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("form");
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({ phoneDial: "+92" });
  const [members, setMembers] = useState<Member[]>([{ name: "", dial: "+92", phone: "", email: "" }]);
  const [regCode, setRegCode] = useState<string[]>(Array(6).fill(""));
  const [dialQuery, setDialQuery] = useState("");
  const [dialOpen, setDialOpen] = useState(false);
  const [memberDialOpenIndex, setMemberDialOpenIndex] = useState<number | null>(null);
  const [memberDialQuery, setMemberDialQuery] = useState("");

  // --- new: backend wiring state ---
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<UserReadResponse | null>(null);
  const [memberWarning, setMemberWarning] = useState<string | null>(null);

  const currentStep = steps[step];
  const currentValue = formData[currentStep?.key] ?? "";
  const isLastStep = step === steps.length - 1;

  const canContinue = (() => {
    switch (currentStep.type) {
      case "text":
        if ("skippable" in currentStep && currentStep.skippable) return true;
        return currentValue.trim().length > 0;
      case "phone":
        return !!formData.phoneDial && (formData.phone ?? "").trim().length > 0;
      case "members":
        return true;
      case "password":
        if (isLastStep) return currentValue.length > 0 && currentValue === formData.password;
        return currentValue.length > 0;
      default:
        return false;
    }
  })();

  const handleChange = (value: string) => setFormData((p) => ({ ...p, [currentStep.key]: value }));

  const handleContinue = async () => {
    if (!canContinue) return;
    if (isLastStep) {
      await submitSignup();
    } else {
      setStep(step + 1);
    }
  };

  const submitSignup = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const user = await signup({
        email: formData.email,
        password: formData.password,
        role: "seller", // public signup only allows "general" | "seller" — no
                         // dedicated "partner" role in this endpoint, so we
                         // use "seller" as the closest fit. Swap this if your
                         // backend exposes a partner-specific signup route.
        full_name: formData.founderName,
        company_name: formData.companyName,
        phone_number: `${formData.phoneDial ?? "+92"}${formData.phone ?? ""}`,
        location: formData.location,
        // NOTE: "website" (step 5) has no matching field on UserCreate, so
        // it is currently NOT sent to the backend. Ask the backend team to
        // add a `website` column if it needs to be persisted.
      });
      setCreatedUser(user);
      setScreen("verify");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    const token = regCode.join("");
    if (token.length !== 6) return;
    setErrorMsg(null);
    setVerifying(true);
    try {
      const user = await verifyEmail(token);
      setCreatedUser(user);

      // Best-effort: create any team members the user added in step 7.
      const validMembers = members.filter((m) => m.name.trim() && m.email.trim());
      if (validMembers.length > 0) {
        if (user.organization_id) {
          const results = await Promise.allSettled(
            validMembers.map((m) =>
              addTeamMember(user.organization_id as string, {
                name: m.name,
                email: m.email,
                phone_number: m.phone ? `${m.dial}${m.phone}` : undefined,
              })
            )
          );
          const failed = results.filter((r) => r.status === "rejected").length;
          if (failed > 0) {
            setMemberWarning(
              `${failed} of ${validMembers.length} team member(s) could not be added. You can add them later from My Team.`
            );
          }
        } else {
          setMemberWarning(
            "Your account is verified, but no organization was returned yet — add your team members from My Team once your organization is set up."
          );
        }
      }

      setScreen("complete");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Invalid or expired code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg(null);
    setResending(true);
    try {
      await resendVerification();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Couldn't resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleSkip = () => setStep(step + 1);
  const handleBack = () => step > 0 && setStep(step - 1);

  const updateMember = (i: number, patch: Partial<Member>) =>
    setMembers((p) => p.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const addMember = () => setMembers((p) => [...p, { name: "", dial: "+92", phone: "", email: "" }]);
  const removeMember = (i: number) => setMembers((p) => p.filter((_, idx) => idx !== i));

  const filteredDials = COUNTRIES.filter(
    (c) => c.code.toLowerCase().includes(dialQuery.toLowerCase()) || c.dial.includes(dialQuery)
  );
  const filteredMemberDials = COUNTRIES.filter(
    (c) => c.code.toLowerCase().includes(memberDialQuery.toLowerCase()) || c.dial.includes(memberDialQuery)
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20px_30px,#00000022,transparent),radial-gradient(1px_1px_at_90px_120px,#00000018,transparent),radial-gradient(1px_1px_at_150px_60px,#0000001f,transparent),radial-gradient(1px_1px_at_220px_180px,#00000018,transparent),radial-gradient(1px_1px_at_300px_40px,#00000022,transparent)] bg-repeat [background-size:320px_320px]" />

      <div className="relative z-10 flex w-[92%] max-w-4xl overflow-hidden rounded-2xl border border-black/10 shadow-2xl">
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

        <div className="flex max-h-[85vh] w-full flex-col overflow-y-auto bg-white px-8 py-7 md:w-1/2">
          <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500">
            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-50 px-2.5 py-1 text-amber-700">
              ✦ Exclusive circle invite
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Secure session
            </span>
          </div>

          <div className="mb-2 flex justify-center">
            <span className="rounded-full border border-black/15 bg-black px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white">
              Admin Panel
            </span>
          </div>

          <div className="mb-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="M1" className="h-9 w-auto object-contain" />
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {screen === "form" && (
            <>
              <h2 className="mb-1 text-center text-sm font-semibold uppercase tracking-wide text-black">
                Sign up as an Industry Partner
              </h2>
              <p className="mb-5 text-center text-xs text-gray-500">
                You&apos;ve been personally invited to join M1&apos;s exclusive partner circle.
              </p>

              <button className={`mb-3 flex items-center justify-center gap-2 border border-black/10 bg-black py-2.5 text-sm font-medium text-white ${cut} ${hoverFx}`}>
                <GoogleIcon />
                Sign up with Google
              </button>
              <button className={`mb-6 flex items-center justify-center gap-2 border border-black/15 bg-white py-2.5 text-sm font-medium text-black ${cut} ${hoverFx}`}>
                <AppleIcon />
                Sign up with Apple
              </button>

              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-black/10" />
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Or fill in details</span>
                <div className="h-px flex-1 bg-black/10" />
              </div>

              <div className="mb-6 flex gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition ${i <= step ? "bg-amber-500" : "bg-black/10"}`} />
                ))}
              </div>

              <label className="mb-1 block text-sm italic text-gray-700">{currentStep.label}</label>
              {"hint" in currentStep && currentStep.hint && currentStep.type !== "password" && (
                <p className="mb-3 text-[11px] leading-snug text-gray-500">{currentStep.hint}</p>
              )}

              {currentStep.type === "text" && (
                <div className="mb-2 mt-2">
                  <UnderlineInput value={currentValue} onChange={handleChange} placeholder={currentStep.placeholder} />
                </div>
              )}

              {currentStep.type === "password" && (
                <div className="mb-2 mt-2">
                  <UnderlineInput type="password" value={currentValue} onChange={handleChange} placeholder="••••••••••••" />
                  {"hint" in currentStep && currentStep.hint && (
                    <p className="mt-2 text-[11px] leading-snug text-gray-500">{currentStep.hint}</p>
                  )}
                </div>
              )}

              {currentStep.type === "phone" && (
                <div className="relative mb-2 mt-2 flex gap-3">
                  <button
                    onClick={() => setDialOpen(!dialOpen)}
                    className="border-b border-black/15 pb-2 text-sm text-black"
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
                    <div className="absolute left-0 top-10 z-20 max-h-40 w-48 overflow-y-auto rounded-md border border-black/10 bg-white shadow-xl">
                      <input
                        autoFocus
                        value={dialQuery}
                        onChange={(e) => setDialQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full border-b border-black/10 bg-transparent px-2 py-1.5 text-xs text-black focus:outline-none"
                      />
                      {filteredDials.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setFormData((p) => ({ ...p, phoneDial: c.dial })); setDialOpen(false); setDialQuery(""); }}
                          className="flex w-full justify-between px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-black/5"
                        >
                          <span>{c.code}</span>
                          <span>{c.dial}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep.type === "members" && (
                <div className="mb-2 mt-2 flex flex-col gap-4">
                  {members.map((m, i) => (
                    <div key={i} className={`relative rounded-md border border-black/10 p-3 ${cut}`}>
                      {members.length > 1 && (
                        <button
                          onClick={() => removeMember(i)}
                          className="absolute right-2 top-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                      <p className="mb-2 text-[10px] uppercase tracking-widest text-gray-500">Member {i + 1}</p>
                      <div className="mb-2">
                        <UnderlineInput value={m.name} onChange={(v) => updateMember(i, { name: v })} placeholder="Full name" />
                      </div>
                      <div className="relative mb-2 flex gap-3">
                        <button
                          onClick={() => setMemberDialOpenIndex(memberDialOpenIndex === i ? null : i)}
                          className="border-b border-black/15 pb-2 text-sm text-black"
                        >
                          {m.dial}
                        </button>
                        <div className="flex-1">
                          <UnderlineInput value={m.phone} onChange={(v) => updateMember(i, { phone: v })} placeholder="Phone number" />
                        </div>
                        {memberDialOpenIndex === i && (
                          <div className="absolute left-0 top-10 z-20 max-h-40 w-48 overflow-y-auto rounded-md border border-black/10 bg-white shadow-xl">
                            <input
                              autoFocus
                              value={memberDialQuery}
                              onChange={(e) => setMemberDialQuery(e.target.value)}
                              placeholder="Search..."
                              className="w-full border-b border-black/10 bg-transparent px-2 py-1.5 text-xs text-black focus:outline-none"
                            />
                            {filteredMemberDials.map((c) => (
                              <button
                                key={c.code}
                                onClick={() => { updateMember(i, { dial: c.dial }); setMemberDialOpenIndex(null); setMemberDialQuery(""); }}
                                className="flex w-full justify-between px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-black/5"
                              >
                                <span>{c.code}</span>
                                <span>{c.dial}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <UnderlineInput value={m.email} onChange={(v) => updateMember(i, { email: v })} placeholder="Email address" />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addMember}
                    className="w-full rounded-md border border-dashed border-black/20 py-2 text-[10px] uppercase tracking-widest text-gray-500 hover:border-black/40 hover:text-gray-800"
                  >
                    + Add another member
                  </button>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {step > 0 && (
                  <button onClick={handleBack} className={`flex w-12 items-center justify-center border border-black/15 bg-white py-2.5 text-sm text-black ${cut}`}>
                    ←
                  </button>
                )}
                <button
                  onClick={handleContinue}
                  disabled={!canContinue || submitting}
                  className={`flex flex-1 items-center justify-center py-2.5 text-sm font-medium uppercase tracking-widest transition ${cut} ${
                    canContinue && !submitting
                      ? "bg-black text-white hover:bg-gray-800"
                      : "cursor-not-allowed bg-[repeating-linear-gradient(135deg,#e5e5e5,#e5e5e5_6px,#efefef_6px,#efefef_12px)] text-gray-400"
                  }`}
                >
                  {submitting ? "Submitting…" : isLastStep ? "Submit & Verify" : "Continue →"}
                </button>
              </div>

              {"skippable" in currentStep && currentStep.skippable && (
                <button onClick={handleSkip} className="mt-3 block w-full text-center text-[10px] uppercase tracking-widest text-gray-400 underline">
                  Skip
                </button>
              )}

              <p className="mt-6 text-center text-xs text-gray-500">
                This invite link is unique to your organisation and can&apos;t be shared publicly.
              </p>
            </>
          )}

          {screen === "verify" && (
            <>
              <div className="mb-6 flex items-center gap-3">
                <BackPill onClick={() => setScreen("form")} />
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-black">Verify Identity</h2>
                  <p className="text-xs text-gray-500">
                    Sent · {createdUser?.email || formData.email || "your@company.com"}
                  </p>
                </div>
              </div>
              <p className="mb-4 text-center text-sm italic text-gray-700">Enter the 6-digit code sent to your company email.</p>
              <div className="mb-6 flex justify-center">
                <OtpInput length={6} values={regCode} onChange={(i, v) => setRegCode((p) => { const n = [...p]; n[i] = v; return n; })} />
              </div>
              <button
                disabled={regCode.some((d) => !d) || verifying}
                onClick={handleVerify}
                className={`w-full py-3 text-sm font-medium uppercase tracking-widest transition ${cut} ${
                  regCode.every((d) => d) && !verifying
                    ? "bg-black text-white hover:bg-gray-800"
                    : "cursor-not-allowed bg-[repeating-linear-gradient(135deg,#e5e5e5,#e5e5e5_6px,#efefef_6px,#efefef_12px)] text-gray-400"
                }`}
              >
                {verifying ? "Verifying…" : "Complete registration"}
              </button>
              <button
                onClick={handleResend}
                disabled={resending}
                className="mt-3 block w-full text-center text-[10px] uppercase tracking-widest text-gray-400 underline disabled:opacity-50"
              >
                {resending ? "Resending…" : "Resend code"}
              </button>
            </>
          )}

          {screen === "complete" && (
            <div className="flex flex-col items-center py-8 text-center">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-black">Welcome to the circle</h2>
              <p className="mb-1 text-xs italic text-gray-700">{formData.companyName || "Your organisation"} is now a registered Industry Partner.</p>
              <p className="mb-4 text-sm text-black">Your account has been created as Admin.</p>
              {memberWarning && (
                <p className="mb-4 max-w-xs text-[11px] leading-snug text-amber-700">{memberWarning}</p>
              )}
              <p className="mb-2 text-xs text-gray-500">Manage your organisation anytime from the My Team page.</p>
              <button
                onClick={() => router.push("/component/industrypartner")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/50 text-amber-700 hover:bg-amber-50 transition"
              >
                ✓
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
    <svg width="15" height="15" viewBox="0 0 384 512" fill="black">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * BACKEND WIRING NOTES
 * ---------------------------------------------------------------------------
 *
 * 3. Known gaps vs. the form, given the current OpenAPI spec:
 *      - `website` (step 5) has no field on UserCreate — not sent. Add a
 *        `website` column server-side (e.g. on UserProfile) if you need it
 *        persisted, then wire it into `submitSignup`.
 *      - Public /auth/signup only accepts role "general" | "seller" — there
 *        is no "partner" role in that enum, so this flow sends "seller".
 *        If the backend has (or adds) a dedicated partner-invite endpoint
 *        that returns an organization_id directly at signup time, swap
 *        `signup()` to call that instead — it would let step 7 team members
 *        be added before verification too.
 *      - Team-member creation assumes `UserRead.organization_id` is set
 *        immediately after /auth/verify-email. If your backend creates the
 *        organization asynchronously, you may need to poll /auth/me instead.
 * ------------------------------------------------------------------------ */