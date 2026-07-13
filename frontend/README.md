# WeddingBook — Wedding Halls Booking Platform

A Next.js 14 (App Router) + TypeScript + Tailwind CSS frontend for a Syrian wedding-halls
booking platform, built to match the provided design mockups and wired conceptually to the
provided Postman API collection (`weding.json`).

## Stack

- **Next.js 14** (App Router, RTL Arabic, `next/font` — Cairo)
- **Tailwind CSS** with a custom design-token theme (rose/coral primary, warm cream background)
- **shadcn/ui-style components**, hand-rolled on Radix primitives (button, card, tabs, dialog,
  select, checkbox, slider, dropdown-menu, avatar, progress, label, badge, input)
- **lucide-react** icons, **recharts** for the admin bookings chart

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

> This container has no network access, so dependencies could not be installed or the app
> built/tested here. Run `npm install` locally — the versions in `package.json` are current
> and compatible with each other (Next 14.2, React 18, Tailwind 3.4).

## Structure

```
src/
  app/
    page.tsx                 → Home (hero + search + featured halls + services)
    halls/page.tsx            → Hall listing with filters sidebar
    halls/[id]/page.tsx       → Hall detail (gallery, tabs, booking sidebar)
    services/page.tsx         → Global services (catering/photography/etc.)
    about/page.tsx
    login/page.tsx, register/page.tsx
    dashboard/page.tsx        → Customer dashboard
    owner/page.tsx            → Hall owner dashboard
    admin/page.tsx            → Admin dashboard
  components/
    ui/                       → shadcn-style primitives
    dashboard/                → DashboardShell (role-aware sidebar), StatCard, BookingsChart
    site-header.tsx, site-footer.tsx, hall-card.tsx, rating.tsx, booking-status-badge.tsx
  lib/
    types.ts                  → Domain types mirrored from the Postman collection schema
    mock-data.ts              → Mock halls/bookings/reviews/users powering every screen
    api.ts                    → Typed fetch wrapper for every real endpoint in weding.json
    utils.ts                  → cn(), formatSYP(), formatDate()
```

## Roles & dashboards (from the API collection)

The API collection defines three roles — `customer`, `hall_owner`, `admin` — each with a
distinct dashboard:

| Role | Route | Sidebar |
|---|---|---|
| Customer | `/dashboard` | حجوزاتي (bookings/mine), التقييمات (reviews), المفضلة, حسابي |
| Hall owner | `/owner` | قاعاتي (halls/mine), الحجوزات (bookings/hall/:id, confirm/reject), الخدمات (caterings/decorations/cars/music per hall) |
| Admin | `/admin` | المستخدمون (users CRUD), القاعات (halls CRUD), الخدمات (global services CRUD), الحجوزات, التقارير |

## Wiring to the real backend

Every screen currently renders from `src/lib/mock-data.ts` so the UI is fully browsable without
a running API. `src/lib/api.ts` already implements a typed function for every endpoint in the
Postman collection (auth, users, halls, caterings, decorations, cars, music, global services,
bookings, reviews). To go live:

1. Set `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3000/api`, matching the collection's
   `base_url` variable).
2. Replace the mock-data imports in each page with the matching `*API` calls, store the JWT
   returned by `AuthAPI.login` (e.g. in an httpOnly cookie or a small auth context), and pass it
   into the authenticated calls.
3. Add real auth/role guards to `/dashboard`, `/owner`, and `/admin` (e.g. middleware reading the
   session cookie and redirecting by role).

## Design notes

The visual language (rose/coral primary `#e63e63`, warm cream background, rounded-2xl cards,
Cairo typeface) was matched directly to the provided screenshots rather than reinvented, per the
brief. Colors, radii and shadows are centralized as design tokens in `tailwind.config.ts` and
`globals.css` — change them once to re-theme the whole app.
