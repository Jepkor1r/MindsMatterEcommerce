# Minds Matter - AI Instructions

## Project Purpose
We are building a real e-commerce application for "Minds Matter", a brand selling screen-free cognitive wellness tools (colouring books, puzzle books, etc.).

## Brand System
- **Primary:** Deep Plum `#4A2545`
- **Secondary:** Warm Coral `#E87861`
- **Accent:** Golden Yellow `#F4C95D`
- **Success:** Sage `#9CAF88`
- **Backgrounds:** Warm Cream `#FFF9F0`, Soft Blush `#F8E8E3`
- **Text:** Deep Charcoal `#292329`, Warm Gray `#716A70`

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind v4
- Database/Auth: Supabase PostgreSQL + Google OAuth
- Email: Mailgun
- Payments: M-Pesa Daraja API + International Provider (Stripe/Paystack)
- Hosting: Vercel

## Coding Conventions
- **Feature-First Architecture:** Group files by feature (e.g., `src/features/cart`).
- **Design Tokens:** Always use CSS variables (e.g., `var(--color-primary)`) from `index.css`, never hardcode hex colors in React components.
- **State Management:** Use simple React Context + `localStorage` for non-critical state (like the initial cart), but rely on Supabase for persistent critical data (orders, users).

## Security Rules
- **NEVER** invent API keys, client secrets, or credentials.
- **NEVER** commit `.env` files to git. Use `.env.example`.
- Frontend is NOT the source of truth for pricing. Totals must be validated server-side.

## Beginner Teaching Requirements
- The user is a BEGINNER. Do not skip steps.
- Explain "Why" and "What" before writing the code.
- Provide step-by-step click instructions for external services (Supabase, Google Cloud, Mailgun).

## Current Status
- **Completed:** Phase 1 (Planning) and Phase 2 (UI mockups).
- **Next Up:** Phase 3 (Database setup with Supabase).
