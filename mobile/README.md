# Minds Matter — Android App

The mobile app for **Minds Matter**, a brand that crafts screen-free tools for
cognitive wellness (colouring books, puzzle books and more).

It is the companion to the website, **https://minds-matter-ecommerce.vercel.app/**,
and shares the same Supabase backend. **One account and one cart work on both.**

- **APK download:** <ADD GOOGLE DRIVE LINK>
- **Demo video:** <ADD LINK>

---

## Features

- **One account for web and mobile.** Sign up or log in with email and
  password. Accounts created on the website work in the app, and accounts
  created in the app work on the website.
- **Product list.** Products load live from the same Supabase `products` table
  the website uses. Pull down to refresh.
- **Cart that syncs both ways.** The cart is saved in the Supabase
  `cart_items` table and linked to your user account:
  - **Web → Mobile:** add an item on the website, open the **Cart** tab in the
    app, and the item is there. The cart reloads every time you open the tab.
  - **Mobile → Web:** add an item in the app, then refresh or switch back to the
    website tab, and the item is there.
- **Cart management.** Change quantities or remove items. Pull down to refresh.
  "Add to Cart" goes through the database function `add_to_cart()`, which
  won't let you add more than the available stock.
- **Secure by default.** Row Level Security in Supabase means each user can
  only read and change their own cart.

## Tech stack

| Part | Technology |
| --- | --- |
| Framework | Expo SDK 57 + React Native, TypeScript |
| Navigation | Expo Router (file-based routes in `src/app/`) |
| Backend | Supabase (PostgreSQL, Auth, Row Level Security) via `@supabase/supabase-js` |
| Session storage | `expo-sqlite` (keeps you logged in between app launches) |
| Builds | EAS Build (Expo's cloud build service) |

## Project structure

```
mobile/
  src/app/              screens (Expo Router)
    _layout.tsx         tabs + shows the login screen when signed out
    index.tsx           Shop screen (product list)
    cart.tsx            Cart screen (reloads each time it is opened)
  src/components/
    LoginScreen.tsx     email/password log in + sign up
  src/lib/
    supabase.ts         the Supabase client
    auth.tsx            login state (session, signIn, signUp, signOut)
    api.ts              products + cart_items queries
    theme.ts            brand colours and price formatting
  app.json              app name, icon, Android package name
  eas.json              EAS build profiles
  .env.example          template for environment variables
```

## How to run it locally

You need **Node.js 20 or newer**, plus either the **Expo Go** app on an
Android phone or an Android emulator.

```bash
# 1. Go into the mobile folder
cd mobile

# 2. Install dependencies
npm install

# 3. Create your environment file from the template
cp .env.example .env
#    Open .env and fill in the values (see the next section)

# 4. Start the development server
npx expo start
```

Then scan the QR code with **Expo Go** on your phone, or press `a` to open
the app in an Android emulator.

## Environment variables

Put these in `mobile/.env`. The file is git-ignored and must never be committed.

| Name | Where to find it |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key |
| `EXPO_PUBLIC_WEBSITE_URL` | The live website, `https://minds-matter-ecommerce.vercel.app` (product images load from here) |

> **Why are these safe?** Expo puts every `EXPO_PUBLIC_` variable into the app
> itself, so anyone could read them. The anon key is designed to be public,
> because Row Level Security protects the data. **Never** put the Supabase
> `service_role` key or any other secret in this file.

For cloud builds, set the same three variables on **expo.dev → project
minds-matter → Environment variables** for the `preview` environment. EAS does
not upload your local `.env`.

## How the APK was built

The Android APK was built in the cloud with **EAS Build** using the `preview`
profile in `eas.json`. That profile produces an installable `.apk` file
(`"buildType": "apk"`).

```bash
npm install -g eas-cli      # one time only
eas login                   # log in to your Expo account
eas build -p android --profile preview
```

When the build finishes, download the `.apk` from the link EAS prints or from
expo.dev → your project → **Builds**. To install it on a phone, open the file
and allow "Install unknown apps" when Android asks.

## Related

- Website (React + Vite) and Supabase SQL: the root of this repository.
- Shared cart table and `add_to_cart()` function: `../supabase/cart.sql`.
