"use client";

import { motion } from "framer-motion";

export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="engine-hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="hero-text">
        <div className="hero-label">M1 · Private Acquisition</div>
        <h1>E-Acquisition Engine</h1>
        <p>Find the perfect aircraft for your mission.</p>
        <button className="btn-sharp btn-dark-active" onClick={onStart}>
          Start Your Search
        </button>
        <div className="hero-dots">
          <span className="hero-dot active" />
          <span className="hero-dot" />
          <span className="hero-dot" />
          <span className="hero-dot" />
        </div>
      </div>
      <div className="hero-img">
        <img
          src="/images/hero.png"
          alt="Private Jet"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </motion.div>
  );
}
