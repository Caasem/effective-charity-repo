# Effective Charity — Mobile App

Native cross-platform app (Expo / React Native) implementing the donor and
charity experience for the Muslim Philanthropy Network. One codebase builds
to iOS, Android, and web.

## Design language

A fusion of two references, per brief:
- **Revolut** — dark canvas, single saturated accent (emerald `#00D68F`),
  huge confident numerals for money/impact figures, snappy spring-animated
  interactions, everything reads as "live."
- **Fortify.qa** — restraint and authority: generous whitespace, declarative
  headlines, minimal iconography, trust signalled through precision (a
  verification badge, a transparency score) rather than decoration.

See `lib/theme.ts` for the full token system (color, type, spacing,
urgency scale) and `components/ui.tsx` for the reusable component library
built on it (Card, Button, ProgressBar, UrgencyBadge, VerifiedBadge, etc).

## Running it

```bash
npm install
npm run web       # fastest way to preview — opens in browser
npm run ios       # requires macOS + Xcode, or scan the QR with Expo Go
npm run android   # requires Android Studio, or scan the QR with Expo Go
```

No native build tools installed? Install the free **Expo Go** app on your
phone, run `npm start`, and scan the QR code — the full native app runs
on your device in seconds without any App Store submission.

## PWA installation

The web export is installable as a Progressive Web App. Expo supplies the
web metadata and the `public/manifest.json` file declares the standalone app
experience, theme, start URL, and existing app icon. A production web export
also registers `public/sw.js` for offline app-shell caching.

```bash
npm run web
# For installability checks, create a production export and serve it over HTTPS
npm run export:web
```

The browser must load the app over HTTPS (or `localhost`) before it will offer
the install prompt. The service worker is intentionally disabled during local
development to avoid stale cached bundles.

## Screens

- **Home** (`app/(tabs)/index.tsx`) — network-wide live stats, critical
  needs carousel, donor/charity role switch, coordination teaser.
- **Map** (`app/(tabs)/map.tsx`) — interactive marker map of active
  initiatives (SVG-based, no external map SDK dependency).
- **Initiatives** (`app/(tabs)/initiatives.tsx`) — searchable, filterable
  list.
- **Charities** (`app/(tabs)/charities.tsx`) — organisation directory,
  charities and business partners.
- **Profile** (`app/(tabs)/profile.tsx`) — donation history and giving
  stats for the session.
- **Initiative detail** (`app/initiative/[id].tsx`) — funding progress,
  needs breakdown, lead organisation, coordination signal.
- **Charity detail** (`app/charity/[id].tsx`) — transparency profile,
  areas of focus, active initiatives.
- **Evidence** (`app/(tabs)/evidence.tsx`) — visible pilot profiles with
  source counts, known facts, evidence gaps, and unresolved identity review.
- **Donate flow** (`app/donate/[id].tsx`) — 3-step giving-type → amount →
  payment → confirmation flow with simulated payment (no real charges).

## What's real vs. simulated

- All UI, navigation, and interaction is real, working code.
- Data (`data/mockData.ts`) is realistic dummy data — the same shape the
  real backend/database (see `../database-schema.sql`) will return.
- Payments are simulated client-side (`lib/store.tsx`) — swap in Stripe's
  React Native SDK against the `/payments` endpoints documented in
  `../API.md` when the backend is live.

## Path to the App Store / Play Store

This app is architecturally ready to ship — what remains needs accounts
only you can create:

1. An Apple Developer account ($99/yr) and a Google Play Developer
   account ($25 one-time).
2. Run `npx eas build --platform ios` / `--platform android` (Expo's
   free-tier build service handles code signing for you) — or build
   locally with Xcode/Android Studio if you prefer.
3. Submit via `eas submit` or upload manually to App Store Connect /
   Play Console.
4. Real app icon, splash screen, and store listing assets (the current
   `assets/` folder has Expo's placeholder icons).
