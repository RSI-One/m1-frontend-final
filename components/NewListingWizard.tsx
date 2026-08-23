"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
const NL_STEP_LABELS = ["Step 1", "Step 2", "Step 3", "Step 4"];

type MediaKind = "ext" | "int";
interface MediaItem {
  uid: string;
  kind: MediaKind;
  url?: string;
  name?: string;
}

interface NlState {
  step: number;
  planeType: string;
  manufacturer: string;
  manufacturerQuery: string;
  model: string;
  modelQuery: string;
  price: number;
  variant: string;
  hours: string;
  description: string;
  reason: string;
  listingType: "" | "verified" | "non-verified";
  sellingMandate: string | null;
  photos: MediaItem[];
  videos: MediaItem[];
  docs: Record<string, string>;
  terms: boolean[];
}

function freshState(): NlState {
  return {
    step: 1,
    planeType: "",
    manufacturer: "",
    manufacturerQuery: "",
    model: "",
    modelQuery: "",
    price: 5,
    variant: "",
    hours: "",
    description: "",
    reason: "",
    listingType: "",
    sellingMandate: null,
    photos: [],
    videos: [],
    docs: {},
    terms: [false, false, false, false],
  };
}

function isValid(s: NlState) {
  if (s.step === 1) {
    return (
      !!s.planeType &&
      !!s.manufacturer &&
      !!s.model &&
      !!s.price &&
      !!s.variant &&
      !!s.hours &&
      !!s.description &&
      s.description.trim().length > 4
    );
  }
  if (s.step === 2) {
    return s.photos.length >= 3 && !!s.reason && s.reason.trim().length > 4;
  }
  if (s.step === 3) {
    if (!s.listingType || !s.sellingMandate) return false;
    const required = s.listingType === "verified" ? Object.values(nlVerifiedDocGroups).flat() : nlNonVerifiedDocs;
    return required.every((d) => s.docs[d]);
  }
  if (s.step === 4) {
    return s.terms.every(Boolean);
  }
  return false;
}

type Screen = "form" | "feature";

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
  const fileExtRef = useRef<HTMLInputElement>(null);
  const fileIntRef = useRef<HTMLInputElement>(null);
  const mandateRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const pendingDoc = useRef<string | null>(null);

  const reset = () => {
    setS(freshState());
    setScreen("form");
    setMfgDropdown(false);
    setModelDropdown(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (screen === "feature") {
        handleClose();
        showToast("Listing submitted — under review before it gets published!");
        return;
      }
      handleClose();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, screen]);

  const update = (patch: Partial<NlState>) => setS((prev) => ({ ...prev, ...patch }));

  const goBack = () => update({ step: s.step - 1 });
  const goNext = () => {
    if (!isValid(s)) return;
    if (s.step === 4) {
      setScreen("feature");
    } else {
      update({ step: s.step + 1 });
    }
  };

  const mfgMatches = useMemo(
    () => Object.keys(nlManufacturers).filter((n) => n.toLowerCase().includes(s.manufacturerQuery.toLowerCase())),
    [s.manufacturerQuery]
  );
  const modelMatches = useMemo(
    () => (nlManufacturers[s.manufacturer] || []).filter((m) => m.toLowerCase().includes(s.modelQuery.toLowerCase())),
    [s.manufacturer, s.modelQuery]
  );

  const pickFiles = (kind: MediaKind, files: FileList | null) => {
    if (!files) return;
    const photos = [...s.photos];
    const videos = [...s.videos];
    Array.from(files).forEach((file) => {
      const uid = Math.random().toString(36).slice(2);
      if (file.type.startsWith("video/")) {
        if (videos.filter((v) => v.kind === kind).length < 2) videos.push({ uid, kind, name: file.name });
      } else if (photos.length < 9) {
        photos.push({ uid, kind, url: URL.createObjectURL(file) });
      }
    });
    update({ photos, videos });
  };

  const removeThumb = (kind: "photo" | "video", uid: string) => {
    if (kind === "photo") update({ photos: s.photos.filter((p) => p.uid !== uid) });
    else update({ videos: s.videos.filter((v) => v.uid !== uid) });
  };

  const openDocUpload = (doc: string) => {
    pendingDoc.current = doc;
    docInputRef.current?.click();
  };

  const onDocFileChosen = (files: FileList | null) => {
    if (!files || !files.length || !pendingDoc.current) return;
    update({ docs: { ...s.docs, [pendingDoc.current]: files[0].name } });
    pendingDoc.current = null;
  };

  if (!open) return null;

  const ready = isValid(s);
  const isFinal = s.step === 4;
  const docGroups = s.listingType === "verified" ? nlVerifiedDocGroups : { "Required Documents": nlNonVerifiedDocs };
  let serial = 0;

  return (
    <>
      {screen === "form" && (
        <div
          className="nl-overlay open"
          id="nlOverlay"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "nlOverlay") handleClose();
          }}
        >
          <div className="nl-modal">
            <button className="nl-close" id="nlCloseBtn" aria-label="Close" onClick={handleClose}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="nl-steps-bar">
              {NL_STEP_LABELS.map((label, i) => {
                const n = i + 1;
                return (
                  <div key={label} className={`nl-step-pill ${n === s.step ? "active" : n < s.step ? "done" : ""}`}>
                    {label}
                  </div>
                );
              })}
            </div>

            {s.step === 1 && (
              <>
                <div className="nl-step-heading">Aircraft &amp; Listing Details</div>
                <div className="nl-card">
                  <h4>Aircraft Identity</h4>
                  <div className="nl-field">
                    <label style={{ color: "#e7e8ec", fontSize: 12, display: "block", marginBottom: 6 }}>Plane type</label>
                    <select className="nl-select" value={s.planeType} onChange={(e) => update({ planeType: e.target.value })}>
                      <option value="">Select plane type…</option>
                      {nlPlaneTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="nl-field nl-autocomplete">
                    <label style={{ color: "#e7e8ec", fontSize: 12, display: "block", marginBottom: 6 }}>Manufacturer</label>
                    <input
                      className="nl-input"
                      placeholder="Start typing manufacturer…"
                      autoComplete="off"
                      value={s.manufacturerQuery}
                      onChange={(e) => update({ manufacturerQuery: e.target.value, manufacturer: "", model: "", modelQuery: "" })}
                      onFocus={() => setMfgDropdown(true)}
                      onBlur={() => setTimeout(() => setMfgDropdown(false), 150)}
                    />
                    <div className={`nl-dropdown ${mfgDropdown && mfgMatches.length ? "show" : ""}`}>
                      {mfgMatches.map((n) => (
                        <div
                          key={n}
                          className="nl-dropdown-item"
                          onMouseDown={() => update({ manufacturer: n, manufacturerQuery: n, model: "", modelQuery: "" })}
                        >
                          <span className="logo-dot">{n.slice(0, 2).toUpperCase()}</span>{n}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="nl-field nl-autocomplete">
                    <label style={{ color: "#e7e8ec", fontSize: 12, display: "block", marginBottom: 6 }}>Model</label>
                    <input
                      className="nl-input"
                      placeholder="Start typing model…"
                      autoComplete="off"
                      value={s.modelQuery}
                      disabled={!s.manufacturer}
                      onChange={(e) => update({ modelQuery: e.target.value, model: "" })}
                      onFocus={() => setModelDropdown(true)}
                      onBlur={() => setTimeout(() => setModelDropdown(false), 150)}
                    />
                    <div className={`nl-dropdown ${modelDropdown && s.manufacturer && modelMatches.length ? "show" : ""}`}>
                      {modelMatches.map((m) => (
                        <div
                          key={m}
                          className="nl-dropdown-item"
                          onMouseDown={() => update({ model: m, modelQuery: m })}
                        >
                          <span className="logo-dot">{s.manufacturer.slice(0, 2).toUpperCase()}</span>{m}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="nl-field">
                    <label style={{ color: "#e7e8ec", fontSize: 12, display: "block", marginBottom: 6 }}>Variant</label>
                    <input
                      className="nl-input"
                      placeholder="e.g. Extended Range"
                      value={s.variant}
                      onChange={(e) => update({ variant: e.target.value })}
                    />
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
                  </div>
                </div>
                <div className="nl-card">
                  <h4>Pricing &amp; Usage</h4>
                  <div className="nl-row"><label>Asking price (USD, millions)</label></div>
                  <div className="nl-slider-row" style={{ marginBottom: 14 }}>
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
                  <div className="nl-field">
                    <label style={{ color: "#e7e8ec", fontSize: 12, display: "block", marginBottom: 6 }}>Total flight hours</label>
                    <input
                      type="number" className="nl-input" placeholder="e.g. 3400"
                      value={s.hours}
                      onChange={(e) => update({ hours: e.target.value })}
                    />
                  </div>
                </div>
                <div className="nl-card">
                  <h4>Description</h4>
                  <textarea
                    className="nl-textarea"
                    placeholder="Cabin layout, notable upgrades, history…"
                    value={s.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </div>
              </>
            )}

            {s.step === 2 && (
              <>
                <div className="nl-step-heading">Images &amp; Selling Information</div>
                <div className="nl-card">
                  <h4>Jet Images</h4>
                  <div className="nl-media-group">
                    <h4 style={{ color: "#e7e8ec" }}>Exterior</h4>
                    <div className="nl-upload-box" onClick={() => fileExtRef.current?.click()}>
                      <input
                        ref={fileExtRef}
                        type="file" accept="image/*,video/*" multiple hidden
                        onChange={(e) => { pickFiles("ext", e.target.files); e.target.value = ""; }}
                      />
                      <strong>Click to upload</strong>
                      <p>Exterior photos / videos</p>
                    </div>
                    <div className="nl-thumbs">
                      {s.photos.filter((p) => p.kind === "ext").map((p) => (
                        <div className="nl-thumb" key={p.uid}>
                          <img src={p.url} alt="" />
                          <span className="rm" onClick={() => removeThumb("photo", p.uid)}>✕</span>
                        </div>
                      ))}
                      {s.videos.filter((v) => v.kind === "ext").map((v) => (
                        <div className="nl-thumb" key={v.uid}>
                          🎬 {v.name}
                          <span className="rm" onClick={() => removeThumb("video", v.uid)}>✕</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="nl-media-group">
                    <h4 style={{ color: "#e7e8ec" }}>Interior</h4>
                    <div className="nl-upload-box" onClick={() => fileIntRef.current?.click()}>
                      <input
                        ref={fileIntRef}
                        type="file" accept="image/*,video/*" multiple hidden
                        onChange={(e) => { pickFiles("int", e.target.files); e.target.value = ""; }}
                      />
                      <strong>Click to upload</strong>
                      <p>Interior photos / videos</p>
                    </div>
                    <div className="nl-thumbs">
                      {s.photos.filter((p) => p.kind === "int").map((p) => (
                        <div className="nl-thumb" key={p.uid}>
                          <img src={p.url} alt="" />
                          <span className="rm" onClick={() => removeThumb("photo", p.uid)}>✕</span>
                        </div>
                      ))}
                      {s.videos.filter((v) => v.kind === "int").map((v) => (
                        <div className="nl-thumb" key={v.uid}>
                          🎬 {v.name}
                          <span className="rm" onClick={() => removeThumb("video", v.uid)}>✕</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="nl-hint" style={{ color: "#aeb1b8" }}>Minimum 3 photos total, maximum 9 photos · up to 2 videos.</div>
                </div>
                <div className="nl-card">
                  <h4>Reason of Selling</h4>
                  <textarea
                    className="nl-textarea"
                    placeholder="e.g. Fleet upgrade, reduced usage…"
                    value={s.reason}
                    onChange={(e) => update({ reason: e.target.value })}
                  />
                </div>
              </>
            )}

            {s.step === 3 && (
              <>
                <div className="nl-step-heading">Listing Verification</div>
                <div className="nl-card">
                  <h4>Listing Class</h4>
                  <div className="nl-toggle-row">
                    <button
                      type="button"
                      className={`nl-toggle-btn ${s.listingType === "verified" ? "picked" : ""}`}
                      data-listing-type="verified"
                      onClick={() => update({ listingType: "verified", docs: {} })}
                    >
                      <strong>VERIFIED</strong>
                      <span>Full document review, golden tag</span>
                    </button>
                    <button
                      type="button"
                      className={`nl-toggle-btn ${s.listingType === "non-verified" ? "picked" : ""}`}
                      data-listing-type="non-verified"
                      onClick={() => update({ listingType: "non-verified", docs: {} })}
                    >
                      <strong>NON-VERIFIED</strong>
                      <span>Fast, minimal documentation</span>
                    </button>
                  </div>
                  <div className="nl-note-box">
                    <div className="note-head">Note</div>
                    <div className="note-body">Verified listings are 21x more visible.</div>
                  </div>
                </div>
                <div className="nl-card">
                  <h4>Selling Mandate</h4>
                  <input
                    ref={mandateRef}
                    type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) update({ sellingMandate: e.target.files[0].name });
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className={`nl-mandate-btn ${s.sellingMandate ? "done" : ""}`}
                    onClick={() => mandateRef.current?.click()}
                  >
                    {s.sellingMandate ? `Uploaded: ${s.sellingMandate}` : "Upload Selling Mandate"}
                  </button>
                </div>
                {s.listingType && (
                  <div className="nl-card">
                    <h4>Documents</h4>
                    <input
                      ref={docInputRef}
                      type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => { onDocFileChosen(e.target.files); e.target.value = ""; }}
                    />
                    {Object.entries(docGroups).map(([group, docs]) =>
                      docs.map((d) => {
                        serial += 1;
                        const uploaded = s.docs[d];
                        return (
                          <div className="nl-doc-row" key={d}>
                            <span className="nl-doc-serial">{String(serial).padStart(2, "0")}</span>
                            <span className="nl-doc-name">{d}</span>
                            {uploaded ? (
                              <span className="nl-doc-filename" onClick={() => showToast(`Opening ${uploaded}…`)}>{uploaded}</span>
                            ) : (
                              <button type="button" className="nl-doc-upload" onClick={() => openDocUpload(d)}>Upload</button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}

            {s.step === 4 && (
              <>
                <div className="nl-step-heading">Final Declarations</div>
                <div className="nl-card">
                  {nlTermsItems.map((t, idx) => (
                    <label className="nl-check-row" style={{ color: "#e7e8ec" }} key={idx}>
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
                </div>
              </>
            )}

            <div className="nl-next-wrap">
              {s.step > 1 && (
                <button type="button" className="nl-back-btn" onClick={goBack}>Back</button>
              )}
              <button
                type="button"
                className={`nl-next-btn ${ready ? "ready" : ""} ${isFinal ? "final-step" : ""}`}
                disabled={!ready}
                onClick={goNext}
              >
                {isFinal ? "Execute" : "Next Step"}
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === "feature" && (
        <div className="nl-feature-overlay open">
          <div className="nl-feature-modal">
            <div className="nl-feature-heading">
              Featuring Listing &amp; Get Discovered by <span className="stat">38x</span> More Clients
            </div>
            <p className="nl-feature-sub">
              Featuring increases the rate of conversion by 10x. We give a very brief and guarantee on every featured listing.
            </p>
            <div className="nl-pkg-row">
              <div className="nl-pkg-card basic">
                <h5>Affordable</h5>
                <div className="price">$150</div>
                <p>Standard placement boost across search &amp; category pages for 7 days.</p>
              </div>
              <div className="nl-pkg-card premium">
                <h5>Premium</h5>
                <div className="price">$450</div>
                <p>Top-of-search priority, homepage carousel spot, and buyer-match alerts for 30 days.</p>
              </div>
            </div>
            <div className="nl-feature-actions">
              <button
                type="button"
                className="nl-feature-next-btn"
                onClick={() => {
                  handleClose();
                  showToast("Listing submitted — featured plan active!");
                }}
              >
                Next
              </button>
              <button
                type="button"
                className="nl-feature-pass"
                onClick={() => {
                  handleClose();
                  showToast("Listing submitted — under review before it gets published!");
                }}
              >
                I&apos;ll pass this time
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
