# Minds Matter - Project Context

## Current Phase: Phase 6 (Mailgun) — code written, awaiting Supabase setup + testing

### Completed Features
- **Phase 1: Planning**
  - Architecture defined, design system established
  - ⚠️ `PRD.md` was never created
- **Phase 2: UI**
  - Vite + React + TypeScript + Tailwind scaffold, design tokens, typography
  - Navbar, Footer, ProductCard
  - Home, Shop (category filter + search), Product Details, Cart, About
  - Cart Context with `localStorage` persistence
  - Checkout UI with form validation
- **Phase 3: Database (Supabase)**
  - `supabase/schema.sql`: profiles, categories, products, orders, order_items, payments, enums, `updated_at` triggers
  - Seeded 5 categories and 5 products (verified via REST API on 2026-10-02)
  - RLS + public read policies on categories/products (`supabase/policies.sql`)
  - Home, Shop and Product pages load data from Supabase (`src/services/api.ts`)

- **Phase 4: Authentication**
  - Done: Google Cloud OAuth client + consent screen (Testing mode), Supabase Google provider enabled
  - Done (code): `AuthContext`, `ProtectedRoute`, `/login` page, real Account page (name/email/logout), Navbar sign-in state, checkout requires sign-in and pre-fills name/email
  - `supabase/auth.sql` run in Supabase (profiles trigger + RLS on private tables)

- **Phase 5: Orders**
  - `supabase/orders.sql`: `create_order()` (SECURITY DEFINER; recalculates prices from `products`, validates input,
    checks stock without reducing it, sequential order numbers `MM-YYYYMMDD-NNNN`, creates a pending `payments` row),
    `get_shipping_fee()` = KES 300 flat. Run in Supabase (verified live: get_shipping_fee returns 300, anon gets permission denied on create_order).
  - `src/services/orders.ts`: `createOrder`, `fetchMyOrders`, `fetchOrderById`
  - Checkout saves real orders; `/account` and new `/orders` show real history; `/orders/:id` shows real details
  - Decisions: Postgres function (no separate backend yet); flat KES 300 shipping; stock is reduced at payment confirmation (Phase 7), only checked at order time

### Features in Progress
- **Phase 6: Mailgun**
  - Decisions: Supabase Edge Functions for server code (also planned for the M-Pesa callback in Phase 7);
    send an "Order received" email now (shows Awaiting payment), add "Payment confirmed" email in Phase 7
  - `supabase/emails.sql`: `order_emails` log table (UNIQUE order_id+email_type, RLS on with no policies = server-only)
  - `supabase/functions/send-order-email`: verifies caller's JWT, loads order only if it belongs to them, claims the
    email row (no duplicates; failed or stuck rows can be retried), sends via Mailgun, records sent/failed.
    Email failure never changes order/payment status.
  - `supabase/functions/_shared/`: `mailgun.ts`, `orderEmail.ts` (branded HTML + text, escapes customer input), `cors.ts`
  - Checkout calls the function after the order is saved and shows sending/sent/failed honestly
  - Pending: run `emails.sql`, set Edge Function secrets, deploy function, test real delivery

### Remaining Features
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

- **Mailgun:** account created (US region), sandbox domain, test recipient verified
  - Sandbox can only send to authorized recipients — need a real domain before launch (Phase 9)

### Environment Configuration
- `.env.local` (git-ignored): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Google credentials live only in the Supabase dashboard
- Mailgun secrets will live only in Supabase Edge Function secrets

### Tests Completed
- `npm run build` passes
- Supabase REST: categories/products return seeded rows (anon key)
- Supabase `/auth/v1/settings`: Google provider enabled
- Supabase → Google authorize redirect reaches the Google sign-in page with the correct redirect URI (config accepted by Google)
- ✅ Manual browser tests (reported by user, 2026-10-02): Google sign-in, profile row created,
  session survives refresh and browser restart, logout, protected routes redirect to /login,
  checkout requires sign-in and returns to checkout with name/email pre-filled

- ✅ Local Postgres 16 test of all SQL files (2026-10-02, fake auth schema): fake browser price ignored
  (charged 4800 not 3), duplicate cart lines merged, stock/unknown/zero-qty/empty/bad-phone/not-signed-in
  rejected with nothing saved, anon cannot call create_order, users cannot see others' orders/items/payments/profiles,
  direct insert into orders blocked by RLS, users cannot update order/payment status or product prices
- ✅ Phase 5 manual app tests (reported by user, 2026-10-02): order placed with correct server total (KES 2,300),
  rows in orders/order_items/payments, order details page, history on /account and /orders, out-of-stock
  message, order still visible after logout + browser restart + re-login, unknown order id shows "Order Not Found"

- ✅ Phase 6 local checks (2026-10-03): Edge Function passes `deno check`; sample email rendered in headless
  Chrome (layout, amounts, Nairobi date, brand message OK; `<script>` in customer name is escaped);
  `emails.sql` loads and re-runs on local Postgres, duplicate email rows blocked, browser role sees no rows
- ⏳ Real Mailgun delivery: NOT yet tested

### Deployment Status
- Not deployed.

### Bugs / Known Issues
- Shipping fee shown in cart/checkout (`SHIPPING_FEE` in services/orders.ts) must be kept in sync with `get_shipping_fee()` — display only
- Orders stay `pending` / awaiting payment until Phase 7
- `src/data/mockData.ts` is unused
- Only 5 of 6 categories seeded ("Digital / Printables" missing); Drawing & Kids have no products
- Lint warnings: Footer `new Date()` in render, ProductPage setState in effect

### Next Action
Run `supabase/emails.sql`, set Edge Function secrets, deploy `send-order-email`, place a test order and confirm the email arrives.
