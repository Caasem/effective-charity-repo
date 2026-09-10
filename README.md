# Effective Charity

A neutral digital network connecting Muslim charities, donors, businesses,
volunteers, and resources to genuine needs — making giving easier, reducing
duplication, and improving accountability.

> The network does not compete with charities. It provides infrastructure
> that helps them work better together.

## What's in this repo

| Path | What it is |
|---|---|
| [`mobile/`](./mobile) | Native cross-platform app (Expo/React Native) — iOS, Android, and web from one codebase. Revolut × Fortify.qa design language. |
| [`data-foundation/`](./data-foundation) | Real data ingestion (Charity Commission, Companies House), entity resolution, and a knowledge graph — the intelligence layer behind the coordination features. |
| [`database/schema.sql`](./database/schema.sql) | PostgreSQL schema for the production backend (organisations, initiatives, needs, donations, evidence, coordination logs). |
| [`docs-API.md`](./docs-API.md) | REST API design for the Express backend. |
| [`docs-DEVELOPMENT.md`](./docs-DEVELOPMENT.md) | Project structure, setup, coding standards. |
| [`docker-compose.yml`](./docker-compose.yml) | Local Postgres + Redis for development. |
| [`prototype.html`](./prototype.html) | Original single-file interactive prototype (donor + charity views, fake payments) — superseded by `mobile/` but kept for reference. |

## Status

- ✅ Mobile app: 8 screens built, typechecks clean, bundles clean (verified with `expo export --platform web`).
- ✅ Data foundation: ingestion + entity resolution + knowledge graph pipeline runs end-to-end against real UK charity registration data.
- ⬜ Backend (Express + Postgres): schema designed, not yet implemented.
- ⬜ Payments: Stripe integration designed, not yet wired up (mobile app currently simulates payment).
- ⬜ App Store / Play Store submission: needs your own Apple/Google developer accounts.

See [`ROADMAP.md`](./ROADMAP.md) for the sprint-by-sprint plan and current backlog.

## Quick start

```bash
# Mobile app
cd mobile && npm install && npm run web

# Data foundation pipeline
cd data-foundation && npm install && cp .env.example .env && npm run pipeline:all
```
