import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0c12",
        "bg-raised": "#10131b",
        panel: "#151923",
        "panel-2": "#1b202c",
        hairline: "rgba(255,255,255,0.08)",
        silver: "#c7cbd4",
        "silver-dim": "#8b909c",
        champagne: "#f3ecdd",
        beige: "#e7c9a3",
        gold: "#cda45e",
        "gold-bright": "#e8c887",
        text: "#eef0f4",
        "text-dim": "#9199a8",
        black2: "#0a0c12",
        danger: "#d9645a",
      },
      fontFamily: {
        display: ["'Big Shoulders Display'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        img: "10px",
      },
      keyframes: {
        fadeInQ: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeInQ: "fadeInQ 0.35s ease",
      },
    },
  },
  plugins: [],
};
export default config;
