# Minds Matter - AI Instructions

## Project Purpose
We are building a real e-commerce application for "Minds Matter", a brand selling screen-free cognitive wellness tools (colouring books, puzzle books, etc.).
Brand statement: "We craft screen-free tools for cognitive wellness." Avoid unsupported medical claims.
Full original brief: `PROMPT.MD`.

## Brand System
- **Primary:** Deep Plum `#4A2545`
- **Secondary:** Warm Coral `#E87861`
- **Accent:** Golden Yellow `#F4C95D`
- **Success:** Sage `#9CAF88`
- **Backgrounds:** Warm Cream `#FFF9F0`, Soft Blush `#F8E8E3`
- **Text:** Deep Charcoal `#292329`, Warm Gray `#716A70`
- **Border:** Soft Taupe `#E5D9D2` · **Error:** `#C94C4C`
- **Typography:** Playfair Display (headings), Inter (body)

## Tech Stack
- Frontend: React 19 + Vite + TypeScript + Tailwind v4, React Router 7
- Database/Auth: Supabase PostgreSQL + Supabase Auth (Google provider)
- Email: Mailgun (Phase 6)
- Payments: M-Pesa Daraja API + International Provider (Phase 7)
- Hosting: Vercel (Phase 9)

## Folder Structure
```
src/
  components/   layout/ (Navbar, Footer), product/ (ProductCard)
  features/     auth/ (AuthContext, ProtectedRoute), cart/ (CartContext)
  lib/          supabase.ts — the single Supabase client
  pages/        one file per route
  services/     api.ts — Supabase queries (categories, products); cart.ts — cart_items queries
  types/        shared TypeScript interfaces
  utils/        formatCurrency
  data/         mockData.ts — UNUSED legacy mock data, safe to delete
supabase/       SQL run manually in the Supabase SQL Editor
  schema.sql    tables, enums, triggers, seed data
  policies.sql  RLS for categories/products + re-seed
  auth.sql      profiles trigger + RLS for profiles/orders/order_items/payments
  orders.sql    create_order() + get_shipping_fee() + order number sequence
  emails.sql    order_emails log table (server-only)
  cart.sql      cart_items table (per-user cart, RLS) + add_to_cart() — shared by web + mobile
  config.toml   Supabase CLI config (project ref, function settings)
  functions/    Supabase Edge Functions (Deno) — server-side code with secrets
    _shared/    mailgun.ts, orderEmail.ts, cors.ts (reused by later functions)
    send-order-email/
```

## Coding Conventions
- **Feature-First Architecture:** Group files by feature (e.g., `src/features/cart`).
- **Design Tokens:** Always use CSS variables (e.g., `var(--color-primary)`) from `index.css`, never hardcode hex colors in React components.
- **State Management:** React Context. Cart: `localStorage` when signed out; Supabase `cart_items` when signed in (merged on sign-in, re-loaded on tab focus) so it syncs with the mobile app. Supabase for persistent critical data (orders, users).
- `npm run build` must pass (it runs `tsc -b`; unused imports/variables are errors).

## Environment Variables
- See `.env.example`. Real values live in `.env.local` (git-ignored).
- **Only public values may start with `VITE_`** — Vite puts every `VITE_` variable in the public browser bundle.
- Current: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Google Client ID/Secret are stored ONLY in the Supabase dashboard, never in this repo.

## Email Architecture
- Browser → `supabase.functions.invoke('send-order-email', { order_id })` → Edge Function checks JWT + ownership → Mailgun.
- Mailgun secrets are Edge Function secrets only. Email HTML uses inline hex colours (email clients can't read CSS variables) — keep in sync with `index.css`.
- Every send is logged in `order_emails`; failures are recorded and retryable and never change order/payment status.
- Deploy: `npx supabase functions deploy send-order-email --project-ref kadmivkopczboezrbrks`

## Security Rules
- **NEVER** invent API keys, client secrets, or credentials.
- **NEVER** commit `.env` files to git. Use `.env.example`.
- Frontend is NOT the source of truth for pricing, totals, payment status or stock. Totals must be validated server-side.
- Every private table must have RLS enabled. The browser has read-only access to its own orders; orders will be written by trusted server-side code (Phase 5).

## Authentication Architecture
- Email + password (`signInWithPassword` / `signUp`, "Confirm email" OFF in Supabase) — the same accounts are used by the mobile app.
- Browser → `supabase.auth.signInWithOAuth({ provider: 'google' })` → Google → `https://<project>.supabase.co/auth/v1/callback` → back to `/login` → redirect to the page the user wanted.
- `AuthContext` exposes `user`, `loading`, `signInWithGoogle`, `signInWithEmail`, `signUpWithEmail`, `signOut`. The session is persisted in localStorage by supabase-js.
- `ProtectedRoute` guards `/checkout`, `/account`, `/account/orders/:id` (UI only — RLS is the real protection).
- DB trigger `on_auth_user_created` creates a `profiles` row on first sign-in.

## Beginner Teaching Requirements
- The user is a BEGINNER. Do not skip steps.
- Explain "Why" and "What" before writing the code.
- Provide step-by-step click instructions for external services (Supabase, Google Cloud, Mailgun).
- Never claim something works unless it was actually tested.

## Current Status
See `PROJECT_CONTEXT.md` for the detailed, up-to-date status.
- **Completed:** Phase 1 (Planning, partial — no PRD.md), Phase 2 (UI), Phase 3 (Database, products/categories live).
- **Completed:** Phase 4 (Authentication, Google sign-in tested manually).
- **Completed:** Phase 5 (Orders) — orders are created ONLY via the `create_order()` Postgres function (supabase/orders.sql).
- **In progress:** Phase 6 (Mailgun) via Supabase Edge Function `send-order-email`.
- **In progress:** Mobile app (Expo, `mobile/`) sharing the same Supabase auth + `cart_items` cart.

## Known Issues
- `PRD.md` was never created. `README.md` is still the Vite template.
