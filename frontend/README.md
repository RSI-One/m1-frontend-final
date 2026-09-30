# M1 Marketplace — Admin Console

A full-featured admin dashboard for the M1 Marketplace platform, built with **Vite + React + TypeScript**.

## Tech Stack

- ⚡ **Vite** — Lightning fast build tool
- ⚛️ **React 19** + **TypeScript** — Component-based UI
- 🎨 **Vanilla CSS** — Custom design system (no Tailwind)
- 🖤 **Dark Mode** — Premium glassmorphism design

## Features

| Module | Description |
|--------|-------------|
| 🗄️ **Databases** | Users, Partners, Assets, Inventory, Off-Market |
| 📊 **E-Acquisition** | Leads, M1 Wall, Efficiency metrics |
| 📡 **Data Fetching** | Asset intelligence & Market news (beta) |
| 📋 **Listings** | Verified listings management |
| ✅ **Verifications** | Active, Approvals queue, Incomplete |
| ⭐ **Featuring** | Requests, Featured listings, Analytics |
| 🤝 **Acquisition / Deal Flow** | 7-stage deal pipeline |
| 💰 **Finance** | Revenue, expenses, transactions |
| ⚠️ **Problems Reported** | Active, Solved, Support log |
| 👤 **Admin Portal** | Manage admins and permissions |
| 📝 **Audit Logs** | Admin activity and security events |

## Role-Based Access Control

| Role | Access |
|------|--------|
| Master Admin | Full access to all modules |
| General Admin | Problems, Listings |
| Customer Care Admin | Problems only |
| BD Admin | Databases, Listings, Verifications, Featuring |
| Executive Admin | BD + Acquisition/Deal Flow |
| Tech Admin | Most modules + Data Fetching |
| Finance Admin | Finance only |
| Listing Admin | Listings only |
| Verification Admin | Verifications only |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at **http://localhost:5173/**

## Project Structure

```
frontend/
├── public/
│   ├── m1-logo.jpeg          # Brand logo
│   └── dashboard.js          # Core dashboard logic
├── src/
│   ├── App.tsx               # Main React component
│   ├── dashboard.css         # Complete design system
│   ├── main.tsx              # React entry point
│   └── index.css             # Base resets
├── index.html                # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
└── package.json
```

## Architecture

The dashboard uses a **hybrid approach**:
- React handles the app shell and lifecycle
- The original vanilla JS logic runs inside React via `useEffect`
- All CSS is the original design system, imported as a module
- Zero external UI libraries — pure custom design

This ensures **100% feature parity** with the original HTML version while fitting into a TypeScript/React project structure.

## Default Admin Session

The app defaults to the **Master Admin** (`Farah Idris`) session. You can switch admin roles by appending `?admin=adX` to the URL:

| Query | Admin | Role |
|-------|-------|------|
| `?admin=ad1` | Farah Idris | Master Admin |
| `?admin=ad2` | Ben Okafor | Executive Admin |
| `?admin=ad3` | Grace Lin | BD Admin |
| `?admin=ad4` | Omar Siddiqui | Tech Admin |
| `?admin=ad5` | Sarah Chen | General Admin |
| `?admin=ad6` | James Porter | Customer Care Admin |
