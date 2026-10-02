# Minds Matter - Project Context

## Current Phase: Phase 4 (Authentication) complete — next: Phase 5 (Orders)

### Completed Features
- **Phase 1: Planning**
  - Architecture defined, design system established
  - ⚠️ `PRD.md` was never created
- **Phase 2: UI**
  - Vite + React + TypeScript + Tailwind scaffold, design tokens, typography
  - Navbar, Footer, ProductCard
  - Home, Shop (category filter + search), Product Details, Cart, About
  - Cart Context with `localStorage` persistence
  - Checkout UI with form validation (mock submit)
- **Phase 3: Database (Supabase)**
  - `supabase/schema.sql`: profiles, categories, products, orders, order_items, payments, enums, `updated_at` triggers
  - Seeded 5 categories and 5 products (verified via REST API on 2026-10-02)
  - RLS + public read policies on categories/products (`supabase/policies.sql`)
  - Home, Shop and Product pages load data from Supabase (`src/services/api.ts`)

- **Phase 4: Authentication**
  - Done: Google Cloud OAuth client + consent screen (Testing mode), Supabase Google provider enabled
  - Done (code): `AuthContext`, `ProtectedRoute`, `/login` page, real Account page (name/email/logout), Navbar sign-in state, checkout requires sign-in and pre-fills name/email
  - `supabase/auth.sql` run in Supabase (profiles trigger + RLS on private tables)

### Features in Progress
- None

### Remaining Features
- **Phase 5:** Real order creation (server-side totals), order history, order details from Supabase
- **Phase 6:** Mailgun email notifications
- **Phase 7:** M-Pesa and International Payment integration
- **Phase 8:** Comprehensive Testing
- **Phase 9:** Deployment to Vercel (add production URL to Google + Supabase, publish OAuth app)
- **Docs:** PRD.md, real README.md

### External Services Configured
- **Supabase:** project created, schema + seed applied, Google provider enabled
- **Google Cloud:** project "Minds Matter", OAuth consent screen (External, Testing), Web OAuth client
  - Authorized JS origin: `http://localhost:5173`
  - Redirect URI: `https://kadmivkopczboezrbrks.supabase.co/auth/v1/callback`
- Supabase URL Configuration: Site URL `http://localhost:5173`, redirect `http://localhost:5173/**`

### Environment Configuration
- `.env.local` (git-ignored): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Google credentials live only in the Supabase dashboard

### Tests Completed
- `npm run build` passes
- Supabase REST: categories/products return seeded rows (anon key)
- Supabase `/auth/v1/settings`: Google provider enabled
- Supabase → Google authorize redirect reaches the Google sign-in page with the correct redirect URI (config accepted by Google)
- ✅ Manual browser tests (reported by user, 2026-10-02): Google sign-in, profile row created,
  session survives refresh and browser restart, logout, protected routes redirect to /login,
  checkout requires sign-in and returns to checkout with name/email pre-filled

### Deployment Status
- Not deployed.

### Bugs / Known Issues
- Checkout still fakes order placement (random order number, nothing saved) — Phase 5
- Shipping fee (300) hardcoded client-side — move server-side in Phase 5
- `src/data/mockData.ts` is unused
- Only 5 of 6 categories seeded ("Digital / Printables" missing); Drawing & Kids have no products
- Lint warnings: Footer `new Date()` in render, ProductPage setState in effect

### Next Action
Start Phase 5 (Orders): explain the server-side order creation approach and get approval before coding.
