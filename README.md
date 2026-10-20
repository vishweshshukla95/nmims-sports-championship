# SVKM's NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27

Official website for the **SVKM's NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27**, organised by the Sports Department, SVKM's NMIMS, and hosted at **Mukesh Patel Technology Park (MPTP), Shirpur Campus**.

---

## 📊 Repository Language Composition

GitHub reports the repository language split as follows:

- **TypeScript**: 91%
- **PLpgSQL**: 7.4%
- **Other**: 1.6%

---

## 🏆 Key Features

- **Mobile-First & Premium Championship Aesthetic**: Midnight Navy (`#1B1F4B`), royal/cobalt blue layered patch textures (`<NavyPatchBackground />`), and champagne gold (`#D9B26F`) typography.
- **Header Layout**: SVKM logo anchored at far left, NMIMS white crest anchored at far right across all viewport breakpoints.
- **Dynamic Countdown & Reporting Notice**: Real-time flip countdown to 27 Oct 2026 09:00 IST with reporting badge (26 Oct 12:00 Noon).
- **Sport Dashboards (`/sports/[sport]`)**:
  - Exactly three tabs: **Schedule · Results · Leaderboard**.
  - **COMING UP** schedule grouped by tournament day with calendar `.ics` download.
  - Interactive completed match scorecards and Man of the Match details modal.
  - Sticky Men/Women category division switcher where applicable.
- **Campus & Team Contingents (`/teams`)**:
  - Dual view modes: Campus View (default) and Sport View.
  - 70 seeded teams across all 7 campuses and 10 categories with expandable squad rosters.
  - Monogram shield badge system for every campus.
- **Tournament Gallery (`/gallery`)**:
  - Responsive masonry grid featuring all 9 highlight photos.
  - Full-screen lightbox with keyboard arrow navigation, swipe, zoom in/out, download, and share.
- **Travel, Rules, & Contacts**:
  - Comprehensive transit hubs with approximate distances from Shirpur.
  - Accommodation details for MPTP Shirpur Campus & MRP School.
  - 10 General Rules, AIU eligibility criteria, and interactive FAQ.
  - Direct calling (`tel:`) and WhatsApp quick-action buttons for committee members.
- **Comprehensive Admin Portal (`/admin`)**:
  - Fixture scheduling, result entries, spreadsheet player stats grid, and MOTM awards.
  - MVP multiplier rules editor with automated recalculation.
  - Storage gallery manager, historical 2025-26 archive, notice ticker, and audit log.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ (App Router) with TypeScript & React 19
- **Styling**: Tailwind CSS with custom design tokens in `tailwind.config.ts` and `globals.css`
- **Icons**: Lucide React
- **Backend & Auth**: Supabase PostgreSQL with Row Level Security (RLS) and SQL views
- **Validation**: Zod
- **Typography**: Google Fonts (`Cinzel`, `Oswald`, `Inter`) via `next/font/google`

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/nmims-sports-championship.git
cd nmims-sports-championship
npm install
```

### 3. Environment Variables

Create `.env.local` by copying `.env.example`:

```bash
cp .env.example .env.local
```

Populate your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build

```bash
npm run build
npm start
```

---

## 🗄️ Database Setup

The database schema, views, and seed data are located in `supabase/`:
- `supabase/migrations/001_init.sql`: Table definitions, foreign keys, RLS policies, and statistical aggregation views.
- `supabase/seed.sql`: 6 sports, 10 categories, 7 campuses, 70 teams, default MVP rules, and key contacts.

Run both files sequentially in the Supabase SQL Editor.

---

## 📜 Documentation

- [Production Deployment Guide](DEPLOY.md)
- [Volunteer Admin Guide](ADMIN_GUIDE.md)

---

© 2026 SVKM's NMIMS Sports Department. All rights reserved.
