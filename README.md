# M1 Marketplace — E-Acquisition Engine (Next.js + TypeScript + Tailwind + Framer Motion)

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Build for production

```bash
npm run build
npm start
```

## Notes
- Converted 1:1 from the original single-file HTML/CSS/vanilla-JS design (same colors, layout, fonts, wizard flow, carousels, modals).
- Sliders, plane-type wizard steps, "Refine & Preview" panel, comparison modal, and asset detail modal are implemented as React components with Framer Motion transitions.
- Image slots use gradient placeholders (the original file's image sources were empty/stripped); swap in real photography in `components/AssetCard.tsx`, `components/AssetModal.tsx`, and `components/CompareModal.tsx` where you see the `linear-gradient` placeholder divs.
