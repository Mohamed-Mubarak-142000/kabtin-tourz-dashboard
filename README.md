# لوحة تحكم كابتن تورز (Dashboard)

Admin dashboard for the Captain Tours Hajj / Umrah / travel-agency site. This is an
independent, separately-deployable app inside the monorepo (siblings: `landing`,
`backend`). It talks to the backend REST API only over HTTP — it does not share
code or a build with the other two folders.

The admin uses this to manage everything shown on the public site: trips/packages
(with images and a map location), branches, testimonials, FAQs, incoming
booking-form leads, and site-wide settings (hero section, contact numbers, social
links, stats, about text).

## Tech stack

- Vite + React 18 + TypeScript
- Tailwind CSS + NextUI (`@nextui-org/react`) + Framer Motion, with a light/dark
  toggle (`class` strategy)
- React Router v6
- `react-hook-form` + `zod` for every form (login, trips, branches, testimonials,
  faqs, settings)
- `axios` with a shared instance that attaches the JWT and redirects to `/login`
  on a 401
- `mapbox-gl` + `react-map-gl` for the click-to-pick location field used in the
  Trip and Branch forms
- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-to-reorder on the FAQs page
- `@headlessui/react` available for any menu/modal not already covered by NextUI
- Default UI direction: Arabic, `lang="ar" dir="rtl"`, Cairo font (this is an
  internal admin tool, so this is a style choice, not a hard requirement — see
  "Deviations" below)

## Requirements

- Node.js 18+ (developed against Node v24.16.0 / npm 11.13.0)
- The backend API running (see the sibling `backend` folder) or at least
  reachable at the URL in `VITE_API_URL`

## Setup

```bash
cd dashboard
npm install
cp .env.example .env
# edit .env: set VITE_API_URL and VITE_MAPBOX_TOKEN
npm run dev
```

The dev server runs on `http://localhost:5174` by default (see `vite.config.ts`).

## Environment variables

See `.env.example`:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend REST API, **including** `/api` (default `http://localhost:5000/api`) |
| `VITE_MAPBOX_TOKEN` | Mapbox GL access token for the map location picker in Trip/Branch forms. Get one free at https://account.mapbox.com/. If left empty, the location picker falls back to plain lat/lng number inputs instead of crashing. |

## Login

There is no self-registration. The single admin account is seeded by the
**backend**, not by this dashboard. Look at the backend's own `.env` /
seed script for:

```
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
```

Log in at `/login` with those credentials. On success the JWT returned by
`POST /auth/login` is stored in `localStorage` under the key `dashboard_token`
and attached as `Authorization: Bearer <token>` to every subsequent API call.
A `401` response from any request clears the stored token and redirects to
`/login`.

## Available scripts

```bash
npm run dev       # start the Vite dev server
npm run build      # type-check (tsc -b) then build for production into dist/
npm run preview    # preview the production build locally
npm run lint       # eslint
```

## Project structure

```
src/
  components/
    common/     # ImageUploader, MapPicker, StringListInput, RatingInput,
                # StatCard, LoadingState, ErrorState, ConfirmDialog
    layout/     # Sidebar, Topbar, ProtectedLayout (auth guard + shell)
  contexts/     # AuthContext (JWT/login/logout), ThemeContext (dark/light)
  lib/          # api.ts (axios instance), services.ts (one function per
                # endpoint), auth.ts (token storage), constants.ts (Arabic
                # label maps)
  pages/
    Login.tsx
    Dashboard.tsx        # overview: stat cards + 5 most recent leads
    trips/               # list + create/edit form
    branches/             # list + create/edit form (map picker)
    testimonials/         # list + create/edit form (rating + avatar upload)
    faqs/                 # list with drag-to-reorder + modal create/edit
    leads/                 # table with inline status change + delete
    settings/              # single form for the Settings singleton
  schemas/      # zod schemas for every form
  types/        # TypeScript types mirroring the backend contract
```

## Pages / routes

| Route | Purpose |
|---|---|
| `/login` | Username/password login |
| `/` | Overview: trip/branch/new-lead counts + recent leads table |
| `/trips`, `/trips/new`, `/trips/:id/edit` | Trip CRUD, image upload, map location, includes list |
| `/branches`, `/branches/new`, `/branches/:id/edit` | Branch CRUD with map location |
| `/testimonials`, `/testimonials/new`, `/testimonials/:id/edit` | Testimonial CRUD with star rating + avatar upload |
| `/faqs` | FAQ list, drag-to-reorder, create/edit modal |
| `/leads` | Booking leads table, status dropdown, delete |
| `/settings` | Single form for the Settings singleton |

## Design tokens

Tailwind + the NextUI plugin are both configured with the exact brand hex
values shared with the `landing` app, so the two independently-deployed
front-ends stay visually consistent even though they don't share code:

- Primary ("Captain Navy"): `50:#EAF0F8 … 600:#163B76 (DEFAULT) … 900:#050F1F`
- Secondary ("Captain Orange"): `50:#FFF3E8 … 500:#F4791A (DEFAULT) … 900:#572706`
- Neutral: Tailwind's built-in `stone` scale

See `tailwind.config.js` for the full scale and the `nextui()` theme wiring
(light and dark variants).

## Notes / deviations from the spec

- **FAQ reordering**: used `@dnd-kit/core` + `@dnd-kit/sortable` (not plain
  up/down buttons). It's a small, well-maintained, actively used dependency
  (~15kb) and the FAQs page's entire purpose is reordering, so the nicer
  drag UX was judged worth the extra dependency.
- **Icons**: added `react-icons` (not in the original tech list) for sidebar/
  topbar/table icons — a standard, lightweight choice that pairs cleanly with
  NextUI and Tailwind without pulling in a heavier icon framework.
- **Trip/branch/testimonial "get by id" for edit forms**: the API contract
  only exposes `GET /trips/:slug` (not by id) and no single-item GET for
  branches/testimonials at all. The edit forms therefore fetch the full list
  (`GET /trips` / `GET /branches` / `GET /testimonials`) and find the record
  by `_id` client-side. This is fine at admin-panel scale; if the backend
  later adds `GET /trips/:id`-by-id or per-id GETs for branches/testimonials,
  swap it in for a lighter request.
- **MapPicker without a Mapbox token**: if `VITE_MAPBOX_TOKEN` is not set, the
  location picker falls back to plain latitude/longitude number inputs
  instead of rendering a broken map or crashing, so the app stays usable in
  environments where a token hasn't been provisioned yet.
- **RTL/LTR**: kept the whole dashboard RTL (`lang="ar" dir="rtl"`, Cairo
  font) per the brief, since it's an internal tool and this matches the
  brand's primary language.

## Verifying it runs

```bash
npm install
npm run build     # tsc -b && vite build — must complete with no TypeScript errors
npm run preview   # or npm run dev
```

The UI renders and every data-fetching page shows a loading spinner then a
friendly Arabic error state (with retry) if the backend isn't reachable —
it will not crash with a blank screen just because `VITE_API_URL` points to a
server that isn't running.
