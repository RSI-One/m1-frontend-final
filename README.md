# M1 Marketplace — Admin Console

A full-featured admin dashboard for the M1 Marketplace platform.

## Tech Stack

- ⚡ Vite + React 19 + TypeScript
- 🎨 Vanilla CSS (custom design system)
- 🖤 Premium dark mode / glassmorphism design

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173/** in your browser.

## Features

- 🗄️ **Databases** — Users, Partners, Assets, Inventory
- 📊 **E-Acquisition** — Leads, M1 Wall, Efficiency
- 📡 **Data Fetching** — Asset intelligence & Market news (beta)
- 📋 **Listings** — Verified listings management
- ✅ **Verifications** — Approvals queue & incomplete listings
- ⭐ **Featuring** — Featured listings & analytics
- 🤝 **Deal Flow** — 7-stage acquisition pipeline
- 💰 **Finance** — Revenue, expenses, transactions
- ⚠️ **Problems** — Support queue & issue tracking
- 👤 **Admin Portal** — Role-based admin management
- 📝 **Audit Logs** — Security event logging

## Role-Based Access

Switch admin roles via URL: `?admin=ad1` through `?admin=ad6`

| ID | Name | Role |
|----|------|------|
| ad1 | Farah Idris | Master Admin |
| ad2 | Ben Okafor | Executive Admin |
| ad3 | Grace Lin | BD Admin |
| ad4 | Omar Siddiqui | Tech Admin |
| ad5 | Sarah Chen | General Admin |
| ad6 | James Porter | Customer Care Admin |
