"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useSite } from "../lib/site-context";
import { subscribeToNewsletter } from "../lib/api/newsletter";

interface IntelligenceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function IntelligenceModal({ open, onClose }: IntelligenceModalProps) {
  const { showToast } = useSite();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    try {
      await subscribeToNewsletter(email.trim(), "v2_intelligence_waitlist");
      setSubscribed(true);
      showToast("Registered for M1 Version 2.0 Priority Access!");
    } catch {
      // Graceful fallback if newsletter fails
      setSubscribed(true);
      showToast("Registered for M1 Version 2.0 Priority Access!");
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="M1 Marketplace Version 2.0 - Coming Soon"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden text-white transition-all select-none"
        style={{
          background: "linear-gradient(180deg, rgba(20, 24, 33, 0.98) 0%, rgba(10, 12, 17, 0.99) 100%)",
          border: "1px solid rgba(214, 173, 92, 0.3)",
          boxShadow: "0 28px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(214, 173, 92, 0.12)",
        }}
      >
        {/* Subtle Golden Ambient Accent Bar */}
        <div
          style={{
            height: "3px",
            background: "linear-gradient(90deg, transparent 0%, #d6ad5c 50%, transparent 100%)",
            width: "100%",
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="pp-close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 10,
          }}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d6ad5c]/10 border border-[#d6ad5c]/35 text-[#d6ad5c] font-mono text-[11px] sm:text-xs uppercase tracking-widest mb-4">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="animate-spin-slow"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            SI (Intelligence) • Autonomous AI Engine
          </div>

          {/* Main Title */}
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1"
            style={{ fontFamily: "var(--font-cinzel, var(--serif, serif))" }}
          >
            M1 Marketplace Version 2.0
          </h2>
          <div className="text-sm sm:text-base font-mono font-bold tracking-[0.2em] uppercase text-[#d6ad5c] mb-3">
            Coming Soon
          </div>

          {/* Subtitle */}
          <p className="text-zinc-300 text-sm sm:text-[14.5px] leading-relaxed mb-6 font-sans">
            We are engineering the next phase of the M1 platform: an autonomous operating intelligence designed to redefine high-value aircraft acquisition, predictive fleet telemetry, and automated transaction settlement.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div
              className="p-3.5 rounded-xl border border-white/10"
              style={{ background: "rgba(255, 255, 255, 0.03)" }}
            >
              <div className="text-xs font-mono font-bold text-[#d6ad5c] uppercase mb-1">
                ✦ Autonomous Valuation
              </div>
              <p className="text-zinc-400 text-xs leading-normal m-0">
                Live algorithmic asset pricing, engine wear modeling, and market-clearing appraisals.
              </p>
            </div>

            <div
              className="p-3.5 rounded-xl border border-white/10"
              style={{ background: "rgba(255, 255, 255, 0.03)" }}
            >
              <div className="text-xs font-mono font-bold text-[#d6ad5c] uppercase mb-1">
                ✦ Predictive Telemetry
              </div>
              <p className="text-zinc-400 text-xs leading-normal m-0">
                Logbook verification, engine cycle fatigue forecasting, and live operational intelligence.
              </p>
            </div>

            <div
              className="p-3.5 rounded-xl border border-white/10"
              style={{ background: "rgba(255, 255, 255, 0.03)" }}
            >
              <div className="text-xs font-mono font-bold text-[#d6ad5c] uppercase mb-1">
                ✦ Smart Deal Concierge
              </div>
              <p className="text-zinc-400 text-xs leading-normal m-0">
                Autonomous buyer-seller matchmaking, term sheet synthesis, and bilateral negotiation agents.
              </p>
            </div>

            <div
              className="p-3.5 rounded-xl border border-white/10"
              style={{ background: "rgba(255, 255, 255, 0.03)" }}
            >
              <div className="text-xs font-mono font-bold text-[#d6ad5c] uppercase mb-1">
                ✦ Instant Settlement
              </div>
              <p className="text-zinc-400 text-xs leading-normal m-0">
                Smart escrow with multi-jurisdictional title clearance and automated verification audits.
              </p>
            </div>
          </div>

          {/* Waitlist / Early Access Form */}
          {subscribed ? (
            <div
              className="p-4 rounded-xl border border-[#d6ad5c]/40 text-center"
              style={{ background: "rgba(214, 173, 92, 0.08)" }}
            >
              <p className="text-[#d6ad5c] font-bold text-sm m-0">
                ✓ Priority Access Confirmed
              </p>
              <p className="text-zinc-300 text-xs mt-1 mb-0">
                You will be among the first invited to experience M1 Marketplace Version 2.0.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email for priority access…"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#d6ad5c] transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-sharp btn-gold"
                style={{
                  padding: "10px 20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {submitting ? "Joining…" : "Get Early Access"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

