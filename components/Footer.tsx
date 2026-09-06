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
            <div className="nav-brand" style={{ marginBottom: 2, flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
              <img src="/images/logo.png" alt="M1 Marketplace" className="brand-mark-img footer-logo" />
              <div className="brand-copy">
                
              </div>
            </div>
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
          <a
            href="https://www.linkedin.com/company/m-onee/"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.8c0-1.62-.03-3.7-2.25-3.7-2.26 0-2.6 1.77-2.6 3.6V23h-4V8z" />
            </svg>
          </a>
          <a href="mailto:support@m-1.tech" aria-label="Email">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 6l10 7 10-7" />
            </svg>
          </a>
          <a href="tel:+14379945030" aria-label="Phone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
          <a
            href="https://rsinternational.net"
            aria-label="Website"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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