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
| 9 | Needs intelligence | 🟡 Partial — `data-foundation` knowledge graph now runs against **live** Charity Commission data for all three pilots (classification, area of operation, trustees, 5yr financials); not yet exposed via API or UI |

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

### Next milestone: three live, auditable profiles

Replace the identifier-only pilot fixtures with live Charity Commission and
Companies House records plus exact official annual-report documents and
website snapshots for Islamic Relief Worldwide, Muslim Aid, and Human Appeal.
Each profile must be provenance-complete at fact level, with unresolved
identity candidates reviewed explicitly. Do this before maps, payments, AI,
or a single composite score.

**Progress (2026-09-24):** Charity Commission side is live. `CHARITY_COMMISSION_API_KEY`
was documented but never actually implemented — built the missing client
(`data-foundation/src/ingest/charityCommissionApi.ts`) against the official
Register of Charities REST API, plus reference-data decoding for
classification codes and area-of-operation (`data-foundation/src/referenceData/`).
Running it against real credentials caught two real bugs, not cosmetic ones:
`node-fetch` was silently ignoring this environment's proxy on every live
call in the pipeline (fixed — `data-foundation/src/ingest/httpClient.ts`),
and two of the three pilot registration numbers were wrong (`1000853` was an
unrelated, removed charity; Human Appeal's real number, `1154288`, wasn't in
the fixtures at all). Both are corrected and the pipeline now produces real
coordination-candidate edges between the three actual charities. Still open:
Companies House side (needs a free `COMPANIES_HOUSE_API_KEY`), and official
website/annual-report snapshots (blocked on this environment's network
egress allowlist, not a code issue — `www.islamic-relief.org.uk`,
`www.muslimaid.org`, `humanappeal.org.uk` would need adding).

**Progress (2026-09-25):** Added a fourth pilot, WISE (charity `1001136`,
High Wycombe), and built the organisation-website layer of `factExtractor.ts`
— previously any website snapshot only ever produced a `source_page_captured`
fact, nothing else. It now pulls `<title>`, meta description, a self-reported
charity number (a real cross-check against the Charity Commission number, not
a guess), and links to governance/financial documents on the page (feeds the
still-empty `*_ANNUAL_REPORT_URL` env vars with real candidates instead of
requiring a manual search from scratch). Ran against the two website
snapshots already collected (Muslim Aid, Human Appeal): both produced a
correct `discovered_document_link` pointing at their real annual-report page.
Two known gaps, not code bugs: Islamic Relief's own site returns a genuine
403 from its bot-blocker (not fixable by us — noted, not chased further per
explicit decision), and WISE's site (`wise-web.org`) isn't in this
environment's network allowlist yet, so it has no website snapshot.

**Progress (2026-09-25, later):** Captured Human Appeal's real 2024 annual
report/audited accounts — its exact URL found directly on the Charity
Commission's own accounts-and-annual-returns page (not guessed, not
discovered by a crawler), verified by content before treating it as
evidence (pypdf/pdfminer confirmed the cover page reads "Human Appeal
Annual Report & Financial Statements 2024" with both the correct charity
number and Companies House number). This caught a real bug in
`officialSources.ts`: it fetched every source with `.text()`, which
silently corrupts binary PDF content via a lossy UTF-8 decode — the
`content_hash` would have hashed mangled bytes, not the real document.
Fixed with a binary-safe path (`collectBinarySource` — buffer fetch, hash
the real bytes, store the PDF as a sibling file next to a metadata-only
snapshot JSON) and added `annual_report_*` extraction to
`factExtractor.ts` using `pdf-parse` — page count, cover text, and a
self-reported charity number cross-checked against the Commission's own
number. Verified end-to-end: the extracted `annual_report_self_reported_
charity_number` (`1154288`) matches Human Appeal's Charity Commission
number exactly. Muslim Aid and Islamic Relief's exact annual report URLs
are still needed (finding them manually was judged faster than more
crawling here).

### Data collection sequence

1. Establish legal identity and historical identifiers.
2. Collect Charity Commission and Companies House records.
3. Collect official websites, annual reports, audited accounts, impact
   reports, programme pages, and governance documents.
4. Preserve raw snapshots and metadata before extracting facts.
5. Attach every fact to its source, date, confidence, and hash.
6. Review identity links and retain unresolved candidates explicitly.
7. Only then derive comparisons, coordination signals, maps, scores, or AI
   summaries. Third-party reporting is a later, separately labelled layer.
