"use client";

import { useState, type FormEvent, type MouseEvent } from "react";
import { useSite } from "../lib/site-context";
import { subscribeToNewsletter } from "@/lib/api/newsletter";

export default function Footer() {
  const { showToast } = useSite();

  const notify = (label: string) => (e: MouseEvent) => {
    e.preventDefault();
    showToast(`${label} — coming soon.`);
  };
  const [email, setEmail] = useState("");
const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!email || status === "loading") return;

  setStatus("loading");
  try {
    await subscribeToNewsletter(email, "footer");
    setStatus("success");
    showToast(`Subscribed — ${email}.`);
    setEmail("");
  } catch (err) {
    setStatus("error");
    const message = err instanceof Error ? err.message : "Something went wrong.";
    showToast(`Subscription failed — ${message}`);
  }
};
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-brand" style={{ marginBottom: 2 }}>
              <div className="brand-mark">M1</div>
              <div className="brand-copy">
                <strong>M1 Marketplace</strong>
                <span>Aviation &amp; Maritime</span>
              </div>
            </div>
            <p>
              A private acquisition engine connecting qualified buyers with verified aircraft and yacht
              sellers across the world&apos;s most exclusive fleets.
            </p>
            <p className="mission">&quot;Access, verified — for the world&apos;s rarest machines.&quot;</p>
          </div>

          <div className="footer-col">
            <h5>Marketplace</h5>
            <ul>
              <li><a href="#workspace">Aircraft</a></li>
              <li><a href="#workspace">Helicopters</a></li>
              <li><a href="#workspace">Jets</a></li>
              <li><a href="#workspace">Yachts</a></li>
              <li><a href="#featured">Featured Listings</a></li>
              <li><a href="#verified">New Listings</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Services</h5>
            <ul>
              <li><a href="#" onClick={notify("Acquisition")}>Acquisition</a></li>
              <li><a href="#" onClick={notify("Brokerage")}>Brokerage</a></li>
              <li><a href="#" onClick={notify("Financing")}>Financing</a></li>
              <li><a href="#" onClick={notify("Insurance")}>Insurance</a></li>
              <li><a href="#" onClick={notify("Inspection")}>Inspection</a></li>
              <li><a href="#" onClick={notify("Concierge")}>Concierge</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Resources</h5>
            <ul>
              <li><a href="#workspace">Research</a></li>
              <li><a href="#" onClick={notify("Market Reports")}>Market Reports</a></li>
              <li><a href="#" onClick={notify("FAQs")}>FAQs</a></li>
              <li><a href="#" onClick={notify("Documentation")}>Documentation</a></li>
              <li><a href="#" onClick={notify("Blog")}>Blog</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Support</h5>
            <ul>
              <li><a href="#" onClick={notify("Contact")}>Contact</a></li>
              <li><a href="#" onClick={notify("Live Chat")}>Live Chat</a></li>
              <li><a href="#" onClick={notify("Email")}>Email</a></li>
              <li><a href="#" onClick={notify("Help Center")}>Help Center</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a href="#" onClick={notify("Privacy Policy")}>Privacy Policy</a></li>
              <li><a href="#" onClick={notify("Terms of Service")}>Terms of Service</a></li>
              <li><a href="#" onClick={notify("Cookie Policy")}>Cookie Policy</a></li>
              <li><a href="#" onClick={notify("Compliance")}>Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-newsletter">
  <div>
    <h4>Join the exclusive circle</h4>
    <p>Curated listings, market intelligence, and off-market opportunities — delivered privately.</p>
  </div>
  <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
    <input
      type="email"
      placeholder="Enter your email address"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      disabled={status === "loading"}
    />
    <button type="submit" disabled={status === "loading"}>
      {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed" : "Subscribe"}
    </button>
  </form>
</div>
        <div className="footer-social">
          <a href="#" aria-label="LinkedIn" onClick={notify("LinkedIn")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.8c0-1.62-.03-3.7-2.25-3.7-2.26 0-2.6 1.77-2.6 3.6V23h-4V8z" />
            </svg>
          </a>
          <a href="#" aria-label="X (Twitter)" onClick={notify("X")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.9 2H22l-7.2 8.2L23 22h-6.6l-5.2-6.8L5.2 22H2l7.7-8.8L1.5 2h6.8l4.7 6.2L18.9 2z" />
            </svg>
          </a>
          <a href="#" aria-label="Facebook" onClick={notify("Facebook")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 22v-8.5H16l.4-3.3h-2.9V8.2c0-1 .3-1.6 1.7-1.6H16V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.4H7v3.3h2.6V22h3.9z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram" onClick={notify("Instagram")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" />
            </svg>
          </a>
          <a href="#" aria-label="YouTube" onClick={notify("YouTube")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="5" width="20" height="14" rx="4" />
              <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>

        <div className="footer-bottom">
          <span>© 2026 M1 Marketplace. All Rights Reserved.</span>
          <div className="links">
            <a href="#" onClick={notify("Privacy Policy")}>Privacy Policy</a>
            <a href="#" onClick={notify("Terms")}>Terms</a>
            <a href="#" onClick={notify("Cookies")}>Cookies</a>
          </div>
          <span>Made with premium UI.</span>
        </div>
      </div>
    </footer>
  );
}
