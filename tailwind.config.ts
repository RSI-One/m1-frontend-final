import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground, #ffffff)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
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
        body: ["'Manrope'", "sans-serif"],       
        mono: ["'IBM Plex Mono'", "monospace"],   
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        img: "10px",
      },
      boxShadow: {
        glass: "0 8px 40px rgba(0,0,0,0.55)",     
      },
      backdropBlur: {
        xs: "2px",                                 
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