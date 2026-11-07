"use client";

import React, { useState, useEffect, useRef, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSite } from "../lib/site-context";
import { subscribeToNewsletter } from "@/lib/api/newsletter";

// ── Supersonic Afterburner Thrust Fire Effect on Mouse Hover ──
export function JetFlameTorch({ idPrefix }: { idPrefix: string }) {
  return (
    <div className="relative w-full h-full">
      {/* Tight, sleek atmospheric glow */}
      <div className="absolute -inset-x-3 -inset-y-1 bg-[radial-gradient(ellipse_at_80%_50%,_rgba(255,255,255,0.9)_0%,_rgba(56,189,248,0.85)_20%,_rgba(249,115,22,0.85)_50%,_transparent_100%)] blur-sm rounded-full opacity-85 mix-blend-screen" />
      <div className="absolute -inset-x-5 -inset-y-1.5 bg-[radial-gradient(ellipse_at_75%_50%,_rgba(255,140,0,0.65)_0%,_rgba(234,88,12,0.35)_50%,_transparent_80%)] blur-md opacity-70 mix-blend-screen" />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[radial-gradient(circle,_#ffffff_0%,_#38bdf8_35%,_#f97316_70%,_transparent_100%)] blur-[1.5px] mix-blend-screen opacity-95" />

      {/* Sharp Supersonic Thrust Stream SVG */}
      <svg
        viewBox="0 0 160 30"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(249,115,22,0.9)]"
      >
        <defs>
          <linearGradient id={`${idPrefix}-torch`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="8%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="20%" stopColor="#fef08a" stopOpacity="1" />
            <stop offset="40%" stopColor="#ff7700" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#ff3d00" stopOpacity="0.8" />
            <stop offset="90%" stopColor="#ea580c" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`${idPrefix}-core`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#fdba74" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`${idPrefix}-needle`} x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="85%" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <radialGradient id={`${idPrefix}-throat`} cx="100%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="70%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          d="M 160,11 C 120,8.5 70,5 28,6.5 C 10,7.5 0,11.5 0,15 C 0,18.5 10,22.5 28,23.5 C 70,25 120,21.5 160,19 Z"
          fill={`url(#${idPrefix}-torch)`}
          filter="blur(0.8px)"
        />

        <path
          d="M 160,12 C 125,10 75,7.5 32,8.5 C 14,10 6,13 6,15 C 6,17 14,20 32,21.5 C 75,22.5 125,20 160,18 Z"
          fill={`url(#${idPrefix}-core)`}
          filter="blur(0.4px)"
        />

        <path
          d="M 160,13.8 C 130,13 90,12 42,13 C 22,13.8 12,14.5 12,15 C 12,15.5 22,16.2 42,17 C 90,18 130,17 160,16.2 Z"
          fill={`url(#${idPrefix}-needle)`}
        />

        <polygon points="140,15 144.5,11.5 149,15 144.5,18.5" fill="#ffffff" filter="drop-shadow(0 0 4px #38bdf8)" />
        <polygon points="115,15 120.5,11 126,15 120.5,19" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
        <polygon points="88,15 94.5,11.5 101,15 94.5,18.5" fill="#fef08a" filter="drop-shadow(0 0 5px #f97316)" />
        <polygon points="62,15 67.5,12.5 73,15 67.5,17.5" fill="#fed7aa" filter="drop-shadow(0 0 4px #ea580c)" />

        <ellipse cx="160" cy="15" rx="6" ry="9" fill={`url(#${idPrefix}-throat)`} />
        <ellipse cx="160" cy="15" rx="3" ry="5" fill="#ffffff" />
      </svg>
    </div>
  );
}

export function FooterJetThrustFire() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
      {/* ── Engine 1: Upper / Tail Engine ── */}
      <div
        className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out origin-right"
        style={{
          top: "67.5%",
          right: "79.3%",
          width: "16%",
          height: "22px",
          transformOrigin: "right center",
          transform: "translateY(-50%) rotate(-24.5deg)",
        }}
      >
        <JetFlameTorch idPrefix="e1" />
      </div>

      {/* ── Engine 2: Lower / Wing Engine ── */}
      <div
        className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out origin-right"
        style={{
          top: "72.4%",
          right: "62.6%",
          width: "16%",
          height: "22px",
          transformOrigin: "right center",
          transform: "translateY(-50%) rotate(-15.5deg)",
        }}
      >
        <JetFlameTorch idPrefix="e2" />
      </div>
    </div>
  );
}

interface FooterProps {
  onOpenSellerMode?: () => void;
  partnerMode?: boolean;
  onNewListing?: () => void;
}

export default function Footer({ onOpenSellerMode, partnerMode, onNewListing }: FooterProps = {}) {
  const { showToast } = useSite();

  const notify = (label: string) => (e: MouseEvent) => {
    e.preventDefault();
    showToast(`${label} — coming soon.`);
  };

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await subscribeToNewsletter(email);
      setStatus("success");
      showToast(`Subscribed — ${email}.`);
      setEmail("");
    } catch (err) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "Something went wrong.";
      showToast(`Subscription failed — ${message}`);
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const applySpeed = () => {
      video.playbackRate = 1.0;
    };

    applySpeed();
    video.play().catch(() => {});

    const startPlay = () => {
      video.play().catch(() => {});
    };
    window.addEventListener("scroll", startPlay, { passive: true, once: true });
    window.addEventListener("click", startPlay, { passive: true, once: true });
    window.addEventListener("touchstart", startPlay, { passive: true, once: true });

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            }
          });
        },
        { rootMargin: "300px" }
      );
      observer.observe(video);
    }

    const handleTimeUpdate = () => {
      if (video.playbackRate !== 1.0) {
        video.playbackRate = 1.0;
      }
      if (video.currentTime >= 10 && video.currentTime < 20) {
        video.currentTime = 20;
      }
      if (video.currentTime >= 55) {
        video.currentTime = 0;
        video.playbackRate = 1.0;
        video.play().catch(() => {});
      } else if (video.duration && video.currentTime >= video.duration - 0.2) {
        video.currentTime = 0;
        video.playbackRate = 1.0;
        video.play().catch(() => {});
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.playbackRate = 1.0;
      video.play().catch(() => {});
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("loadedmetadata", applySpeed);
    video.addEventListener("play", applySpeed);
    video.addEventListener("canplay", applySpeed);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("scroll", startPlay);
      window.removeEventListener("click", startPlay);
      window.removeEventListener("touchstart", startPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadedmetadata", applySpeed);
      video.removeEventListener("play", applySpeed);
      video.removeEventListener("canplay", applySpeed);
    };
  }, []);

  return (
    <footer className={`relative bg-black text-white pt-40 sm:pt-48 pb-16 overflow-hidden border-t border-zinc-900 select-none site-footer ${partnerMode ? "partner-footer" : ""}`}>
      {/* ── Background Video covering entire footer ───────────────────── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-80"
        src="/videos/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* Subtle dark tint over full video for clean contrast & text readability */}
      <div className="absolute inset-0 bg-black/55 pointer-events-none z-0" />

      {/* ── Background Ambience Glows ───────────────────────────────── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── Left Supersonic Jet (Hovering with Streamlines & Dynamic Afterburner Fire) ── */}
      <div className="absolute left-[-25px] sm:left-0 md:left-6 lg:left-12 top-[-45px] sm:top-[-32px] md:top-[-24px] lg:top-[-20px] w-[340px] sm:w-[460px] md:w-[560px] lg:w-[640px] h-[230px] sm:h-[310px] md:h-[380px] lg:h-[430px] z-10 group pointer-events-auto cursor-pointer">
        <div className="relative w-full h-full flex items-center justify-center rotate-[12deg] transition-transform duration-500 ease-out group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-[14deg] animate-[flightBobLeft_4.5s_easeInOut_infinite]">
          <div className="relative w-full aspect-[1376/768]">
            {/* Small Moving Airflow / Speed Slipstream Lines */}
            <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
              <span className="absolute top-[35%] left-[25%] w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent blur-[0.5px] animate-[slipstream_1.4s_linear_infinite]" />
              <span className="absolute top-[48%] left-[45%] w-24 sm:w-36 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent blur-[0.5px] animate-[slipstream_1.1s_linear_infinite] delay-300" />
              <span className="absolute top-[62%] left-[18%] w-20 sm:w-28 h-[1.5px] bg-gradient-to-r from-transparent via-sky-300/70 to-transparent blur-[0.5px] animate-[slipstream_1.7s_linear_infinite] delay-700" />
              <span className="absolute top-[22%] left-[55%] w-14 sm:w-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[0.5px] animate-[slipstream_1.3s_linear_infinite] delay-500" />
            </div>

            {/* Transparent PNG Jet */}
            <Image
              src="/images/footer-jet.png"
              alt="M1 Supersonic Interceptor"
              fill
              sizes="(max-width: 768px) 340px, 640px"
              className="object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]"
            />

            {/* Dynamic Supersonic Afterburner Thrust Fire on Hover */}
            <FooterJetThrustFire />
          </div>
        </div>
      </div>

      {/* ── Right Supersonic Jet (Mirrored, Banking toward Top Center & Dynamic Thrust Fire) ── */}
      <div className="absolute right-[-25px] sm:right-0 md:right-6 lg:right-12 top-[-10px] sm:top-2 w-[340px] sm:w-[460px] md:w-[560px] lg:w-[640px] h-[230px] sm:h-[310px] md:h-[380px] lg:h-[430px] z-10 group pointer-events-auto cursor-pointer">
        <div className="relative w-full h-full flex items-center justify-center scale-x-[-1] rotate-[12deg] transition-transform duration-500 ease-out group-hover:-translate-x-3 group-hover:-translate-y-3 group-hover:rotate-[14deg] animate-[flightBobRight_4.5s_easeInOut_infinite]">
          <div className="relative w-full aspect-[1376/768]">
            {/* Small Moving Airflow / Speed Slipstream Lines */}
            <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
              <span className="absolute top-[35%] left-[25%] w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent blur-[0.5px] animate-[slipstream_1.4s_linear_infinite]" />
              <span className="absolute top-[48%] left-[45%] w-24 sm:w-36 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent blur-[0.5px] animate-[slipstream_1.1s_linear_infinite] delay-300" />
              <span className="absolute top-[62%] left-[18%] w-20 sm:w-28 h-[1.5px] bg-gradient-to-r from-transparent via-sky-300/70 to-transparent blur-[0.5px] animate-[slipstream_1.7s_linear_infinite] delay-700" />
              <span className="absolute top-[22%] left-[55%] w-14 sm:w-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[0.5px] animate-[slipstream_1.3s_linear_infinite] delay-500" />
            </div>

            {/* Transparent PNG Jet */}
            <Image
              src="/images/footer-jet.png"
              alt="M1 Supersonic Fleet Interceptor"
              fill
              sizes="(max-width: 768px) 340px, 640px"
              className="object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]"
            />

            {/* Dynamic Supersonic Afterburner Thrust Fire on Hover */}
            <FooterJetThrustFire />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        {/* ── Main Footer Columns Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-16 border-b border-zinc-900">
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-light tracking-[0.25em] text-white uppercase font-sans">
                M1 Marketplace
              </span>
            </div>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-sm">
              The premier private acquisition engine connecting qualified principals with verified aircraft and maritime assets across exclusive fleets.
            </p>
            <div className="pt-2 text-xs sm:text-sm font-mono text-zinc-500 space-y-2">
              <div className="text-zinc-300 space-y-1">
                <div className="text-xs text-zinc-400 uppercase tracking-widest font-sans font-medium">Headquarters</div>
                <div>100 King Street West, Suite 5600</div>
                <div>Toronto, ON, Canada</div>
                <a href="tel:+14379945030" className="hover:text-white transition-colors block text-sm sm:text-base">
                  +1 (437) 994-5030
                </a>
              </div>
              <div className="text-zinc-300 space-y-1">
                <div className="text-xs text-zinc-400 uppercase tracking-widest font-sans font-medium">Global Network</div>
                <a
                  href="https://rsinternational.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors block text-sm sm:text-base"
                >
                  rsinternational.net ↗
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Resources & Tools */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-mono uppercase tracking-[0.2em] text-white font-medium">
              {partnerMode ? "Seller Tools" : "Resources"}
            </h3>
            <ul className="space-y-2.5 text-sm sm:text-base text-zinc-300">
              {partnerMode ? (
                <>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onNewListing) onNewListing();
                        else showToast("Create Listing — coming soon.");
                      }}
                      className="hover:text-white transition-colors inline-block"
                    >
                      Create Listing
                    </a>
                  </li>
                  <li><a href="#" onClick={notify("Manage Listings")} className="hover:text-white transition-colors inline-block">Manage Listings</a></li>
                  <li><a href="#" onClick={notify("Buyer Inquiries")} className="hover:text-white transition-colors inline-block">Buyer Inquiries</a></li>
                  <li><a href="#" onClick={notify("Seller Analytics")} className="hover:text-white transition-colors inline-block">Seller Analytics</a></li>
                </>
              ) : (
                <>
                  <li>
                    <a href="#workspace" className="hover:text-white transition-colors inline-block">
                      Research
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={notify("Market Reports")} className="hover:text-white transition-colors inline-block">
                      Market Reports
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={notify("FAQs")} className="hover:text-white transition-colors inline-block">
                      FAQs
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={notify("Documentation")} className="hover:text-white transition-colors inline-block">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={notify("Blog")} className="hover:text-white transition-colors inline-block">
                      Blog
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-mono uppercase tracking-[0.2em] text-white font-medium">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm sm:text-base text-zinc-300">
              <li>
                <a href="#" onClick={notify("Contact")} className="hover:text-white transition-colors inline-block">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" onClick={notify("Help Desk")} className="hover:text-white transition-colors inline-block">
                  Help Desk
                </a>
              </li>
              <li>
                <a href="#" onClick={notify("Live Concierge")} className="hover:text-white transition-colors inline-block">
                  Live Concierge
                </a>
              </li>
              <li>
                <a href="#" onClick={notify("Security Audit")} className="hover:text-white transition-colors inline-block">
                  Security Audit
                </a>
              </li>
              <li>
                <a href="#" onClick={notify("Escrow Protocol")} className="hover:text-white transition-colors inline-block">
                  Escrow Protocols
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Legal */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-mono uppercase tracking-[0.2em] text-white font-medium">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm sm:text-base text-zinc-300">
              <li>
                <a href="#workspace" className="hover:text-white transition-colors inline-block">
                  Aviation Fleet
                </a>
              </li>
              <li>
                <a href="#workspace" className="hover:text-white transition-colors inline-block">
                  Maritime Fleet
                </a>
              </li>
              <li>
                <a href="#" onClick={notify("Marketplace Standards")} className="hover:text-white transition-colors inline-block">
                  Marketplace Standards
                </a>
              </li>
              <li>
                <a href="#" onClick={notify("Verification Badge")} className="hover:text-white transition-colors inline-block">
                  Verification Badges
                </a>
              </li>
              <li>
                <a href="#" onClick={notify("Compliance")} className="hover:text-white transition-colors inline-block">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Newsletter Section (M1 High-Tech Aesthetic) ──────────── */}
        <div id="exclusive-circle" className="newsletter-box border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md rounded-2xl p-6 sm:p-10 mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div>
            <h4 className="text-xl sm:text-2xl font-light text-white tracking-wide">
              Join the exclusive circle
            </h4>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Curated listings, market intelligence, and off-market opportunities — delivered privately.
            </p>
          </div>
          <form className="flex flex-col sm:flex-row gap-3 w-full" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
              className="flex-1 bg-zinc-900/90 border border-zinc-700/60 focus:border-white rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white transition-all font-mono disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-widest px-7 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 duration-200 whitespace-nowrap cursor-pointer"
            >
              {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed" : "Subscribe"}
            </button>
          </form>
        </div>

        {/* ── Social Media Icons & Channels ───────────────────────── */}
        <div className="flex items-center gap-3 mb-10">
          <a
            href="https://www.linkedin.com/company/m-onee/"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-zinc-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.8c0-1.62-.03-3.7-2.25-3.7-2.26 0-2.6 1.77-2.6 3.6V23h-4V8z" />
            </svg>
          </a>
          <a
            href="mailto:support@m-1.tech"
            aria-label="Email"
            className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-zinc-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 6l10 7 10-7" />
            </svg>
          </a>
          <a
            href="tel:+14379945030"
            aria-label="Phone"
            className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-zinc-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
          <a
            href="https://rsinternational.net"
            aria-label="Website"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-zinc-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </a>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────────── */}
        <div className="pt-8 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-zinc-400 font-mono">
          <div>© 2026 M1 Marketplace. All Rights Reserved.</div>
          <div className="flex items-center gap-6">
            <a href="#" onClick={notify("Privacy Policy")} className="hover:text-zinc-200 transition-colors">
              Privacy Policy
            </a>
            <a href="#" onClick={notify("Terms")} className="hover:text-zinc-200 transition-colors">
              Terms
            </a>
            <a href="#" onClick={notify("Cookies")} className="hover:text-zinc-200 transition-colors">
              Cookies
            </a>
          </div>
          <span className="text-zinc-500">{partnerMode ? "Seller Console" : "Made with premium UI."}</span>
        </div>
      </div>
    </footer>
  );
}
