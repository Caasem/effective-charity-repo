# Roadmap & Working Backlog

This file is the single source of truth for what's done, what's in
progress, and what's next. Autonomous work sessions read this file first,
update it as they go, and leave it in a state the next session (or the
user, opening the repo cold) can pick up from immediately.

## Product goal

Create a neutral digital network that connects Muslim charities, donors,
businesses, volunteers and resources to genuine needs — making giving
easier, reducing duplication and improving accountability.

## Sprint status

| Sprint | Focus | Status |
|---|---|---|
| 0 | Product definition | ✅ Done (see `PROJECT_BRIEF.md`) |
| 1 | The Network (data model) | ✅ Done — `database/schema.sql` |
| 2 | The Donor journey | ✅ Done in mobile prototype (browse/search/donate/track) |
| 3 | The Charity dashboard | 🟡 Partial — UI exists (initiative/charity detail), no real backend yet |
| 4 | Coordination | 🟡 Partial — UI teaser + real graph logic in `data-foundation`, not wired to live app |
| 5 | Business network | ⬜ Not started (schema supports it; no UI yet) |
| 6 | Volunteer network | ⬜ Not started |
| 7 | Accountability | 🟡 Partial — transparency score displayed in mobile app using mock data; no verification pipeline |
| 8 | Payment infrastructure | ⬜ Simulated only — no real Stripe integration |
| 9 | Needs intelligence | 🟡 Partial — `data-foundation` knowledge graph answers "who's active where," not yet exposed via API or UI |

## Active backlog (worked autonomously, top to bottom)

1. **Express backend skeleton** — stand up the API described in
   `docs-API.md` against `database/schema.sql` (Postgres via
   docker-compose). Start with read-only endpoints (`GET /initiatives`,
   `GET /organisations`) backed by seed data ported from
   `mobile/data/mockData.ts`.
2. **Wire mobile app to the backend** — replace `data/mockData.ts` reads
   in the mobile app with real API calls (TanStack Query), behind a
   feature flag so the app still runs standalone.
3. **Expose the knowledge graph via API** — add
   `GET /organisations/:id/coordination-candidates` backed by
   `data-foundation/src/graph/queries.ts`, and surface it in the
   initiative detail screen instead of the current hardcoded teaser copy.
4. **Business & volunteer profiles** — extend the schema usage and add
   two new mobile screens (business profile, volunteer profile) per
   Sprint 5/6 of the original brief.
5. **Stripe integration** — replace the simulated payment step in
   `mobile/app/donate/[id].tsx` with the real Stripe React Native SDK
   against `POST /payments/create-payment-intent`.
6. **CI** — GitHub Actions: typecheck + `expo export --platform web` on
   every push (fast, catches the class of error most likely to recur).

## How autonomous sessions should work

- Read this file first. Pick the top unstarted/in-progress item.
- Make a real, verifiable increment — not a stub. Prefer "one thing fully
  working" over "five things scaffolded."
- Update the sprint table and backlog above before finishing.
- Commit with a clear message; push.
- If genuinely blocked on a decision only the project owner can make
  (e.g. choice of payment provider beyond Stripe, a design direction with
  real tradeoffs), leave a `## Open questions` entry below rather than
  guessing silently.

## Open questions

_(none currently)_
