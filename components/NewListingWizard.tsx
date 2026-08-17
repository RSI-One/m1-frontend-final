"use client";

import { useMemo, useRef, useState } from "react";

const nlManufacturers: Record<string, string[]> = {
  Gulfstream: ["G280", "G450", "G550", "G650", "G650ER", "G700", "G800"],
  Bombardier: ["Challenger 350", "Challenger 650", "Global 5500", "Global 6500", "Global 7500", "Global 8000"],
  Dassault: ["Falcon 2000LXS", "Falcon 6X", "Falcon 7X", "Falcon 8X"],
  Embraer: ["Phenom 300E", "Praetor 500", "Praetor 600", "Legacy 500"],
  Cessna: ["Citation Longitude", "Citation Latitude", "Citation X+"],
  Airbus: ["ACJ319neo", "ACJ320neo", "ACJ350"],
  Boeing: ["BBJ MAX 7", "BBJ MAX 8", "BBJ 787"],
};
const nlPlaneTypes = [
  "Light Jet", "Midsize Jet", "Super-Midsize Jet", "Large Cabin Jet",
  "Ultra Long Range Jet", "Turboprop", "Helicopter", "Airliner (VIP)",
];
const nlVariantSuggestions = ["Base Configuration", "Extended Range", "VIP Cabin", "Corporate Shuttle", "Executive Layout"];
const nlNonVerifiedDocs = [
  "Registration Certificate", "Certificate of Airworthiness", "Seller Declaration",
  "Aircraft Specification Sheet", "Aircraft Hours & Cycles", "Maintenance Status Report",
  "Latest Inspection Report", "Engine Status Report",
];
const nlVerifiedDocGroups: Record<string, string[]> = {
  "Ownership & Legal Documents": ["Certificate of Registration", "Certificate of Airworthiness", "Seller Ownership Declaration", "Previous Bill of Sale", "Lien Declaration", "Broker Authorisation Agreement", "Trust Ownership Documents"],
  "Aircraft Information Documents": ["Aircraft Specification Sheet", "Aircraft Description", "Asking Price"],
  "Maintenance Documents": ["Latest Maintenance Status Report", "Last 24 Months Maintenance Records", "Most Recent Inspection Report", "Major Inspection Reports", "Shop Visit Reports", "Deferred Maintenance List", "Maintenance Tracking Report Export"],
  "Compliance Documents": ["AD Compliance Report", "SB Compliance Report", "STC Documentation", "RVSM Approval Certificate", "ADS-B Compliance Certificate"],
  "Engine Documents": ["Engine Status Report", "Engine Program Status", "Engine Program Enrollment Certificate", "Latest Borescope Report", "Hot Section Inspection Report", "Engine Trend Monitoring Report"],
  "Aircraft Usage & Health Documents": ["Current Aircraft Hours & Cycles"],
  "Incident & History Documents": ["Damage Disclosure Statement", "Accident History Disclosure", "Repair Documentation"],
  "Insurance Documents": ["Current Insurance Certificate"],
  "Marketing Documents": ["Professional Specification Brochure", "Aircraft Walkaround Video"],
};
const nlTermsItems = [
  "I have read the SOP and Privacy Policy.",
  "I hereby declare M1 as the spokesperson and representative for my listings.",
  "I undertake that attempting fraud, fake listing, and taking users to communicate outside M1 without approval might result in serious legal consequences.",
  "I agree with the terms of use.",
];

const NL_TOTAL_STEPS = 11;

interface NlState {
  step: number;
  planeType: string;
  manufacturer: string;
  model: string;
  price: number;
  variant: string;
  hours: string;
  description: string;
  reason: string;
  listingType: "" | "verified" | "non-verified";
  photos: string[];
  videos: string[];
  docs: Record<string, string>;
  terms: boolean[];
}

function freshState(): NlState {
  return {
    step: 0,
    planeType: "", manufacturer: "", model: "", price: 5, variant: "", hours: "",
    description: "", reason: "", listingType: "",
    photos: [], videos: [], docs: {}, terms: [false, false, false, false],
  };
}

function isValid(s: NlState) {
  switch (s.step) {
    case 0: return !!s.planeType;
    case 1: return !!s.manufacturer && !!s.model;
    case 2: return !!s.price && s.price > 0;
    case 3: return !!s.variant;
    case 4: return !!s.hours;
    case 5: return !!s.description && s.description.trim().length > 4;
    case 6: return !!s.reason && s.reason.trim().length > 4;
    case 7: return !!s.listingType;
    case 8: return s.photos.length >= 3;
    case 9: {
      const required = s.listingType === "verified" ? Object.values(nlVerifiedDocGroups).flat() : nlNonVerifiedDocs;
      return required.every((d) => s.docs[d]);
    }
    case 10: return s.terms.every(Boolean);
    default: return false;
  }
}

type Screen = "form" | "submitted-choice" | "under-review" | "plans" | "billing" | "payment";

export default function NewListingWizard({
  open,
  onClose,
  showToast,
}: {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}) {
  const [s, setS] = useState<NlState>(freshState);
  const [screen, setScreen] = useState<Screen>("form");
  const [mfgDropdown, setMfgDropdown] = useState(false);
  const [modelDropdown, setModelDropdown] = useState(false);
  const [plan, setPlan] = useState<"basic" | "bundle">("bundle");
  const [billingMonths, setBillingMonths] = useState<1 | 6 | 12 | 18>(6);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const pendingDoc = useRef<string | null>(null);

  const reset = () => {
    setS(freshState());
    setScreen("form");
    setPlan("bundle");
    setBillingMonths(6);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const update = (patch: Partial<NlState>) => setS((prev) => ({ ...prev, ...patch }));

  const goBack = () => update({ step: s.step - 1 });
  const goNext = () => {
    if (!isValid(s)) return;
    if (s.step === NL_TOTAL_STEPS - 1) {
      setScreen("submitted-choice");
    } else {
      update({ step: s.step + 1 });
    }
  };

  const mfgMatches = useMemo(
    () => Object.keys(nlManufacturers).filter((n) => n.toLowerCase().includes(s.manufacturer.toLowerCase())),
    [s.manufacturer]
  );
  const modelMatches = useMemo(
    () => (nlManufacturers[s.manufacturer] || []).filter((m) => m.toLowerCase().includes(s.model.toLowerCase())),
    [s.manufacturer, s.model]
  );

  const billingPrice = (base: number, months: number) => {
    const discounts: Record<number, number> = { 1: 0, 6: 0.1, 12: 0.15, 18: 0.2 };
    return (base * months * (1 - discounts[months])).toFixed(0);
  };

  const onPickPhotos = (files: FileList | null) => {
    if (!files) return;
    const photos = [...s.photos];
    const videos = [...s.videos];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("video/")) {
        if (videos.length < 2) videos.push(file.name);
      } else if (photos.length < 9) {
        photos.push(URL.createObjectURL(file));
      }
    });
    update({ photos, videos });
  };

  const removeThumb = (kind: "photo" | "video", idx: number) => {
    if (kind === "photo") {
      const photos = s.photos.filter((_, i) => i !== idx);
      update({ photos });
    } else {
      const videos = s.videos.filter((_, i) => i !== idx);
      update({ videos });
    }
  };

  const openDocUpload = (doc: string) => {
    if (s.docs[doc]) return;
    pendingDoc.current = doc;
    docInputRef.current?.click();
  };

  const onDocFileChosen = (files: FileList | null) => {
    if (!files || !files.length || !pendingDoc.current) return;
    update({ docs: { ...s.docs, [pendingDoc.current]: files[0].name } });
    pendingDoc.current = null;
  };

  if (!open) return null;

  return (
    <div className="nl-overlay open">
      <div className="nl-modal">
        <button className="nl-close" aria-label="Close" onClick={handleClose}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {screen === "form" && (
          <>
            <div className="nl-dots">
              {Array.from({ length: NL_TOTAL_STEPS }).map((_, i) => (
                <div key={i} className={`nl-dot ${i < s.step ? "done" : i === s.step ? "active" : ""}`} />
              ))}
            </div>
            <div className="nl-qnum">Question {s.step + 1} of {NL_TOTAL_STEPS}</div>

            {s.step === 0 && (
              <>
                <div className="nl-question">What type of aircraft are you listing?</div>
                <div className="nl-field">
                  <select
                    className="nl-select"
                    value={s.planeType}
                    onChange={(e) => update({ planeType: e.target.value })}
                  >
                    <option value="">Select plane type…</option>
                    {nlPlaneTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {s.step === 1 && (
              <>
                <div className="nl-question">Manufacturer &amp; model</div>
                <div className="nl-field nl-autocomplete">
                  <input
                    className="nl-input"
                    placeholder="Start typing manufacturer…"
                    autoComplete="off"
                    value={s.manufacturer}
                    onChange={(e) => update({ manufacturer: e.target.value, model: "" })}
                    onFocus={() => setMfgDropdown(true)}
                    onBlur={() => setTimeout(() => setMfgDropdown(false), 150)}
                  />
                  <div className={`nl-dropdown ${mfgDropdown && s.manufacturer && mfgMatches.length ? "show" : ""}`}>
                    {mfgMatches.map((n) => (
                      <div
                        key={n}
                        className="nl-dropdown-item"
                        onMouseDown={() => { update({ manufacturer: n, model: "" }); setMfgDropdown(false); }}
                      >
                        <span className="logo-dot">{n.slice(0, 2).toUpperCase()}</span>{n}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="nl-field nl-autocomplete">
                  <input
                    className="nl-input"
                    placeholder="Start typing model…"
                    autoComplete="off"
                    value={s.model}
                    disabled={!s.manufacturer}
                    onChange={(e) => update({ model: e.target.value })}
                    onFocus={() => setModelDropdown(true)}
                    onBlur={() => setTimeout(() => setModelDropdown(false), 150)}
                  />
                  <div className={`nl-dropdown ${modelDropdown && modelMatches.length ? "show" : ""}`}>
                    {modelMatches.map((m) => (
                      <div
                        key={m}
                        className="nl-dropdown-item"
                        onMouseDown={() => { update({ model: m }); setModelDropdown(false); }}
                      >
                        <span className="logo-dot">{s.manufacturer.slice(0, 2).toUpperCase()}</span>{m}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {s.step === 2 && (
              <>
                <div className="nl-question">What&apos;s your asking price? (USD, millions)</div>
                <div className="nl-slider-row">
                  <input
                    type="range" min={0.5} max={120} step={0.5}
                    value={s.price}
                    onChange={(e) => update({ price: parseFloat(e.target.value) })}
                  />
                  <input
                    type="number" className="nl-input nl-slider-box" step={0.5}
                    value={s.price}
                    onChange={(e) => update({ price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="nl-hint">Drag the slider or type an exact figure.</div>
              </>
            )}

            {s.step === 3 && (
              <>
                <div className="nl-question">Variant</div>
                <div className="nl-field">
                  <input
                    className="nl-input"
                    placeholder="e.g. Extended Range"
                    value={s.variant}
                    onChange={(e) => update({ variant: e.target.value })}
                  />
                </div>
                <div className="nl-suggestions">
                  {nlVariantSuggestions.map((v) => (
                    <span
                      key={v}
                      className={`nl-chip ${s.variant === v ? "picked" : ""}`}
                      onClick={() => update({ variant: v })}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </>
            )}

            {s.step === 4 && (
              <>
                <div className="nl-question">Total flight hours</div>
                <div className="nl-field">
                  <input
                    type="number" className="nl-input" placeholder="e.g. 3400"
                    value={s.hours}
                    onChange={(e) => update({ hours: e.target.value })}
                  />
                </div>
              </>
            )}

            {s.step === 5 && (
              <>
                <div className="nl-question">Describe the aircraft</div>
                <div className="nl-field">
                  <textarea
                    className="nl-textarea"
                    placeholder="Cabin layout, notable upgrades, history…"
                    value={s.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </div>
              </>
            )}

            {s.step === 6 && (
              <>
                <div className="nl-question">Reason for selling</div>
                <div className="nl-field">
                  <textarea
                    className="nl-textarea"
                    placeholder="e.g. Fleet upgrade, reduced usage…"
                    value={s.reason}
                    onChange={(e) => update({ reason: e.target.value })}
                  />
                </div>
              </>
            )}

            {s.step === 7 && (
              <>
                <div className="nl-question">Listing type</div>
                <div className="nl-toggle-row">
                  <div
                    className={`nl-toggle-btn ${s.listingType === "verified" ? "picked" : ""}`}
                    onClick={() => update({ listingType: "verified" })}
                  >
                    <strong>Verified</strong>
                    <span>Trustworthy — full document review, $250 one-time verification fee, golden tag.</span>
                  </div>
                  <div
                    className={`nl-toggle-btn ${s.listingType === "non-verified" ? "picked" : ""}`}
                    onClick={() => update({ listingType: "non-verified" })}
                  >
                    <strong>Non-verified</strong>
                    <span>Fast — minimal documentation, listed sooner.</span>
                  </div>
                </div>
              </>
            )}

            {s.step === 8 && (
              <>
                <div className="nl-question">Asset photos &amp; videos</div>
                <div className="nl-upload-box" onClick={() => fileInputRef.current?.click()}>
                  <input
                    ref={fileInputRef}
                    type="file" accept="image/*,video/*" multiple hidden
                    onChange={(e) => { onPickPhotos(e.target.files); e.target.value = ""; }}
                  />
                  <strong>Click to upload</strong>
                  <p>Minimum 3, maximum 9 photos · up to 2 videos</p>
                </div>
                <div className="nl-thumbs">
                  {s.photos.map((p, i) => (
                    <div className="nl-thumb" key={`p${i}`}>
                      <img src={p} alt="" />
                      <span className="rm" onClick={() => removeThumb("photo", i)}>✕</span>
                    </div>
                  ))}
                  {s.videos.map((v, i) => (
                    <div className="nl-thumb" key={`v${i}`}>
                      🎬 {v}
                      <span className="rm" onClick={() => removeThumb("video", i)}>✕</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {s.step === 9 && (
              <>
                <div className="nl-question">
                  Documentation{s.listingType === "verified" ? " — Verified listing" : ""}
                </div>
                <input
                  ref={docInputRef}
                  type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => { onDocFileChosen(e.target.files); e.target.value = ""; }}
                />
                {Object.entries(
                  s.listingType === "verified" ? nlVerifiedDocGroups : { "Required Documents": nlNonVerifiedDocs }
                ).map(([group, docs]) => (
                  <div className="nl-doc-group" key={group}>
                    <h4>{group}</h4>
                    {docs.map((d) => (
                      <div className="nl-doc-row" key={d}>
                        <span>{d}</span>
                        <button
                          type="button"
                          className={`nl-doc-upload ${s.docs[d] ? "done" : ""}`}
                          onClick={() => openDocUpload(d)}
                        >
                          {s.docs[d] ? "Uploaded ✓" : "Upload"}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

            {s.step === 10 && (
              <>
                <div className="nl-question">Final declarations</div>
                {nlTermsItems.map((t, idx) => (
                  <label className="nl-check-row" key={idx}>
                    <input
                      type="checkbox"
                      checked={s.terms[idx]}
                      onChange={(e) => {
                        const terms = [...s.terms];
                        terms[idx] = e.target.checked;
                        update({ terms });
                      }}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </>
            )}

            <div className="nl-next-wrap">
              {s.step > 0 && (
                <button className="nl-back-btn" onClick={goBack}>Back</button>
              )}
              <button
                className={`nl-next-btn ${isValid(s) ? "ready" : ""}`}
                disabled={!isValid(s)}
                onClick={goNext}
              >
                {s.step === NL_TOTAL_STEPS - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </>
        )}

        {screen === "submitted-choice" && (
          <div className="nl-upsell">
            <h3>Feature your listing</h3>
            <p>Featured assets get <strong>12.3x</strong> more trusted and <strong>8.9x</strong> more discovered.</p>
            <div className="nl-upsell-actions">
              <button className="nl-ghost-btn" onClick={() => setScreen("under-review")}>Not now</button>
              <button className="nl-gold-btn" onClick={() => setScreen("plans")}>Feature now</button>
            </div>
          </div>
        )}

        {screen === "under-review" && (
          <div className="nl-upsell">
            <h3>Listing submitted</h3>
            <p>Your listing is under review before it gets published!</p>
            <div className="nl-upsell-actions">
              <button className="nl-gold-btn" style={{ flex: "none", width: "100%" }} onClick={handleClose}>Done</button>
            </div>
          </div>
        )}

        {screen === "plans" && (
          <div className="nl-upsell">
            <h3>Choose your plan</h3>
            <p>Verification is a one-time task, featuring renews monthly.</p>
            <div className="nl-plans">
              <div
                className={`nl-plan-card ${plan === "basic" ? "selected" : ""}`}
                onClick={() => setPlan("basic")}
              >
                <h5>Basic</h5>
                <div className="price">$300<span style={{ fontSize: 11, color: "var(--muted)" }}>/mo</span></div>
                <ul>
                  <li>Verified featuring</li>
                  <li>+ $250 one-time verification fee</li>
                  <li>Non-verified alt: $550/mo</li>
                </ul>
              </div>
              <div
                className={`nl-plan-card ${plan === "bundle" ? "selected" : ""}`}
                onClick={() => setPlan("bundle")}
              >
                <h5>Bundle (Best value)</h5>
                <div className="price">$1500<span style={{ fontSize: 11, color: "var(--muted)" }}>/mo</span></div>
                <ul>
                  <li>3 listings</li>
                  <li>Verification + Featuring included</li>
                  <li>Future listings feature free</li>
                </ul>
              </div>
            </div>
            <div className="nl-upsell-actions">
              <button className="nl-gold-btn" style={{ flex: "none", width: "100%" }} onClick={() => setScreen("billing")}>
                Continue
              </button>
            </div>
          </div>
        )}

        {screen === "billing" && (() => {
          const base = plan === "bundle" ? 1500 : 300;
          const total = billingPrice(base, billingMonths);
          return (
            <div className="nl-upsell">
              <h3>Billing period</h3>
              <p>{plan === "bundle" ? "3-listing bundle" : "Basic verified featuring"} — ${base}/month</p>
              <div className="nl-billing-opts">
                {[1, 6, 12, 18].map((m) => (
                  <div
                    key={m}
                    className={`nl-billing-opt ${billingMonths === m ? "selected" : ""}`}
                    onClick={() => setBillingMonths(m as 1 | 6 | 12 | 18)}
                  >
                    <span className="l">{m} month{m > 1 ? "s" : ""} retainer</span>
                    <span className="r">{m === 1 ? "No discount" : m === 6 ? "10% off" : m === 12 ? "15% off" : "20% off"}</span>
                  </div>
                ))}
              </div>
              <div className="nl-bill-total">
                <span>Total due today</span>
                <span className="amt">${total}</span>
              </div>
              <div className="nl-upsell-actions">
                <button className="nl-gold-btn" style={{ flex: "none", width: "100%" }} onClick={() => setScreen("payment")}>
                  Proceed to payment
                </button>
              </div>
            </div>
          );
        })()}

        {screen === "payment" && (
          <div className="nl-upsell">
            <h3>Payment via Stripe</h3>
            <p>Secure checkout will open here once Stripe is integrated.</p>
            <div className="nl-upsell-actions">
              <button
                className="nl-gold-btn"
                style={{ flex: "none", width: "100%" }}
                onClick={() => {
                  handleClose();
                  showToast("Listing submitted — featured plan active!");
                }}
              >
                Confirm &amp; publish listing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
