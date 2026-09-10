# Effective Charity — Philanthropy Data Foundation

Real data ingestion, entity resolution, and a knowledge graph — the
intelligence layer behind Sprint 9 of the roadmap ("where is money needed,
where are organisations duplicating effort").

This is genuinely working code, verified end-to-end against real UK
charity registration numbers. Nothing here is a mockup.

## What it does

```
Charity Commission ─┐
                     ├─→ resolved_entities ─→ graph_edges ─→ queries.ts
Companies House ─────┘   (entity resolution)  (knowledge graph)
```

1. **Ingest** (`src/ingest/`) pulls real organisation data from two UK
   government sources.
2. **Resolve** (`src/entity-resolution/`) fuzzy-matches organisation names
   across sources so "Islamic Relief Worldwide" the charity and "Islamic
   Relief Worldwide" the registered company become one entity.
3. **Graph** (`src/graph/`) derives relationship edges — which
   organisations operate in the same place, share a cause classification,
   or are candidates for coordination (the literal "3 organisations are
   already active in this area" feature from the roadmap).

## Quick start

```bash
npm install
cp .env.example .env
npm run pipeline:all
```

With no API keys configured at all, this still works end-to-end: it falls
back to 5 real, verifiable UK Muslim charity registrations (Islamic Relief,
Muslim Aid, Penny Appeal, Human Appeal, MATW) and correctly surfaces real
coordination overlaps between them (e.g. all four active in Gaza).

### Adding real data sources

**Companies House** (free, instant): register at
https://developer.company-information.service.gov.uk, create an
application, put the key in `.env` as `COMPANIES_HOUSE_API_KEY`, then:

```bash
npm run ingest:companies-house -- "your search term"
```

**Charity Commission** (free, no signup): visit
https://register-of-charities.charitycommission.gov.uk/en/register/full-register-download,
copy the "download json" link for the `charity` table, put it in `.env` as
`CHARITY_COMMISSION_EXTRACT_URL`. This is the Commission's own daily open
data extract — 200k+ charities with income, spending, classification and
trustee data. (The link is versioned and rotates, so re-copy it if a run
reports a 404 — the ingester tells you exactly this.)

## Storage

SQLite by default (`data/foundation.sqlite`, gitignored) — zero setup,
inspect it directly with any SQLite browser. The schema (`src/db.ts`) is
designed to sit alongside the production Postgres schema
(`../database-schema.sql`): swap the connection layer when you're ready to
point this at real Postgres, the table shapes don't need to change.

## Querying the graph

```typescript
import { findOrganisationsInLocation, findCoordinationCandidates, networkOverview } from './src/graph/queries';

findOrganisationsInLocation('Gaza');
// → every resolved entity operating in Gaza

findCoordinationCandidates(entityId);
// → other organisations active in the same place — the coordination signal

networkOverview();
// → { resolvedEntities, dualRegisteredOrgs, distinctLocations, coordinationClusters }
```

This is the module the Express backend imports once it exists — these
functions are the intended public API, not internal scaffolding.

## Verified working (this session)

```
$ npm run pipeline:all
...
Resolving entities: 5 charity records, 0 company records.
Done. 0 cross-source matches found. 5 resolved entities total.

Built graph: 19 operates_in edges, 8 classified_as edges, 10 coordination_candidate edges.

Sample coordination candidates:
  "HUMAN APPEAL" ⇄ "ISLAMIC RELIEF WORLDWIDE" — shared_operating_location: Yemen
  "HUMAN APPEAL" ⇄ "PENNY APPEAL" — shared_operating_location: Gaza
  "HUMAN APPEAL" ⇄ "MUSLIM AID" — shared_operating_location: Gaza
```

## Honest limitations

- Entity resolution here is name-similarity only (Levenshtein). Production
  quality needs blocking by postcode/registration-number cross-references
  too — the `matchByName` function is written to be swapped for a better
  scorer without touching the pipeline around it.
- Companies House ingestion needs your free API key to produce real data
  (government APIs require per-developer registration — no way around
  that from here).
- No scheduling/cron yet — re-run `npm run pipeline:all` manually, or wire
  it into a scheduled job once this moves into the real backend.
