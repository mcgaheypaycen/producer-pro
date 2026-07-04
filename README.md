# Producer Pro

A subscription web app for producers of cabaret-style shows. Manage your roster of performers, venues, and acts; build show lineups; generate show packages (media files + RTF run sheet) straight into your Google Drive; and settle the books when the curtain falls.

## Features

- **Shows** — Create a show, pick the venue, set the ticket price, and build the running order from performer acts and segments (host welcome, games, announcements, etc.). Drag to reorder.
- **Acts library** — Each act stores performer, aesthetic, length, lighting notes, stage notes, tagline, and an attached media file (audio, video, or image) uploaded to your Google Drive. Acts are reusable across shows and searchable.
- **Performers roster** — Stage name, legal name, email, phone, payment method, and payment handle (Venmo, CashApp, PayPal, etc.). Searchable.
- **Venues** — Name, address, contact, capacity, notes. Searchable.
- **Show packages** — One click builds a folder in your Google Drive containing every media file named `[POSITION IN SHOW] [PERFORMER NAME] [ACT NAME]` plus a styled RTF run sheet. Media is copied server-side inside Drive — no re-uploading.
- **Close out** — After the show, record money in by source, expenses, performer payouts, and tickets sold. Live profit math, then close the show out.
- **Past shows** — Revisit any closed show and export a settlement CSV.
- **Desktop import** — Moving from the old desktop app? Import your `producer-pro-data.json` from the account menu.

## Architecture

| Concern | Service |
|---|---|
| Frontend | React 18 + Vite, deployed as a static site (Vercel) |
| Auth | Supabase Auth with Google sign-in |
| Database | Supabase Postgres (JSONB documents, row-level security per user) |
| File storage | The user's own Google Drive (`drive.file` scope — app-created files only) |
| Billing | Stripe subscription (single plan + free trial) via Supabase Edge Functions |

Structured data (performers, venues, acts, shows) lives in Postgres and is tiny.
Heavy files (act media, show packages) live in each user's own Drive, so storage
costs nothing regardless of user count.

## Local development

Requires Node.js 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Without a `.env` file the app runs in **demo mode**: no sign-in, data persisted
to localStorage, Drive/billing simulated. To run against real services, copy
`.env.example` to `.env` and fill in your Supabase project values.

## Production setup (one time)

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema: `supabase db push` (or paste `supabase/migrations/20260701000000_init.sql` into the SQL editor).
3. Copy the project URL and anon key into your frontend env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

### 2. Google OAuth (sign-in + Drive)

1. In [Google Cloud Console](https://console.cloud.google.com), create an OAuth client (web application). Add your Supabase callback URL (`https://YOUR-REF.supabase.co/auth/v1/callback`) as an authorized redirect URI.
2. Enable the **Google Drive API** for the project, and add the `.../auth/drive.file` scope on the OAuth consent screen.
3. In Supabase → Authentication → Providers → Google, paste the client ID and secret.
4. Before public launch, submit the app for Google OAuth verification (the `drive.file` scope needs a brief review; test users work immediately).

### 3. Stripe

1. Create a product with one recurring price; note the price ID.
2. Deploy the edge functions:

```bash
supabase functions deploy create-checkout-session create-portal-session stripe-webhook google-refresh-token
```

3. Set function secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_PRICE_ID=price_... \
  TRIAL_DAYS=14 SITE_URL=https://your-app.example \
  GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=...
```

4. Add a Stripe webhook endpoint pointing at
   `https://YOUR-REF.supabase.co/functions/v1/stripe-webhook` with events
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted` — then set
   `STRIPE_WEBHOOK_SECRET` as a function secret too.

### 4. Deploy the frontend (Vercel)

1. Import the repo into [Vercel](https://vercel.com) — it auto-detects Vite (`npm run build`, output `dist/`).
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.
3. Add the deployed URL to Supabase → Authentication → URL Configuration (site URL + redirect URLs), and set it as `SITE_URL` in the function secrets.

## Project layout

```
supabase/
  migrations/      Postgres schema: profiles + 4 collections, RLS policies
  functions/       Deno edge functions: Stripe checkout/portal/webhook, Google token refresh
src/               React app
  auth.jsx         session + profile + subscription gating context
  lib/             supabase client, data API, Google Drive, RTF/CSV builders, billing, sfx
  pages/           Shows, Show editor, Close-out, Performers, Acts, Venues, Login, Paywall
  components/      shared UI, account menu, desktop-data importer
  styles.css       Atelier design system — dark Adobe-inspired workspace
assets/
  audio/sfx/       UI sound effects (generated via fal.ai Stable Audio 3 SFX)
  motion/          Ambient video loops (generated via fal.ai Luma Ray 3.2)
  illustrations/   Empty states + auth/onboarding art (generated via fal.ai FLUX.2)
  brand/           Logo + wordmark variants (white SVGs for dark UI)
shared/            run sheet typography config (used by UI + RTF builder)
```

## Design system

The UI uses a dark, Adobe pro-tool–inspired workspace ("Atelier"): a deep
charcoal canvas, dense panels with hairline separators, a violet primary
echoing Premiere Pro, and warm gold accents preserving the cabaret heritage.

- **Sound effects** — generated via fal.ai (`fal-ai/stable-audio-3/small/sfx`)
  and played through `src/lib/sfx.js`. A mute toggle lives in the rail footer.
  Sounds respect `prefers-reduced-motion` and the browser's autoplay policy.
- **Ambient video loops** — generated via fal.ai (`luma/agent/ray/v3.2/text-to-video`)
  for the loading screen and auth side panel.
- **Illustrations** — generated via fal.ai (`fal-ai/flux-2/klein/9b`) for the
  auth art, onboarding hero, and five empty-state illustrations.
