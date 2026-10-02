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
  services/     api.ts — Supabase queries (categories, products)
  types/        shared TypeScript interfaces
  utils/        formatCurrency
  data/         mockData.ts — UNUSED legacy mock data, safe to delete
supabase/       SQL run manually in the Supabase SQL Editor
  schema.sql    tables, enums, triggers, seed data
  policies.sql  RLS for categories/products + re-seed
  auth.sql      profiles trigger + RLS for profiles/orders/order_items/payments
```

## Coding Conventions
- **Feature-First Architecture:** Group files by feature (e.g., `src/features/cart`).
- **Design Tokens:** Always use CSS variables (e.g., `var(--color-primary)`) from `index.css`, never hardcode hex colors in React components.
- **State Management:** React Context + `localStorage` for non-critical state (cart). Supabase for persistent critical data (orders, users).
- `npm run build` must pass (it runs `tsc -b`; unused imports/variables are errors).

## Environment Variables
- See `.env.example`. Real values live in `.env.local` (git-ignored).
- **Only public values may start with `VITE_`** — Vite puts every `VITE_` variable in the public browser bundle.
- Current: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Google Client ID/Secret are stored ONLY in the Supabase dashboard, never in this repo.

## Security Rules
- **NEVER** invent API keys, client secrets, or credentials.
- **NEVER** commit `.env` files to git. Use `.env.example`.
- Frontend is NOT the source of truth for pricing, totals, payment status or stock. Totals must be validated server-side.
- Every private table must have RLS enabled. The browser has read-only access to its own orders; orders will be written by trusted server-side code (Phase 5).

## Authentication Architecture
- Browser → `supabase.auth.signInWithOAuth({ provider: 'google' })` → Google → `https://<project>.supabase.co/auth/v1/callback` → back to `/login` → redirect to the page the user wanted.
- `AuthContext` exposes `user`, `loading`, `signInWithGoogle`, `signOut`. The session is persisted in localStorage by supabase-js.
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
- **Next:** Phase 5 (Orders).

## Known Issues
- `PRD.md` was never created. `README.md` is still the Vite template.
- Checkout is still a mock (client-generated order number, nothing saved) until Phase 5.
- Routes use `/account/orders/:id`; the brief asks for `/orders` and `/orders/:id`.
