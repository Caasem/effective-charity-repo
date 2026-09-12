# Effective Charity — Philanthropy Data Foundation

Real data ingestion, entity resolution, and a knowledge graph — the
intelligence layer behind Sprint 9 of the roadmap ("where is money needed,
where are organisations duplicating effort").

The first milestone is a reproducible, auditable foundation for three UK
pilot charities: Islamic Relief Worldwide, Muslim Aid, and Human Appeal.
Identifier-only fixtures are used when live credentials or downloads are not
available; no financial or impact facts are fabricated.

## What it does

```
Charity Commission ─┐
                     ├─→ resolved_entities ─→ graph_edges ─→ queries.ts
Companies House ─────┘   (entity resolution)  (knowledge graph)
```

1. **Ingest** (`src/ingest/`) uses Charity Commission and Companies House
   adapters, preserving raw snapshots, hashes, URLs, identifiers, and dates.
   `officialSources.ts` optionally snapshots pilot websites and manually
   configured annual-report URLs.
   Snapshots can be collected without the SQLite native driver: the adapter
   writes auditable JSON files to `SOURCE_SNAPSHOT_DIR` (default
   `data/source-snapshots/`) and can be imported into the database later.
2. **Resolve** (`src/entity-resolution/`) creates canonical records and
   fact-level provenance. Muslim Aid identity candidates are stored as
   unresolved relationships and are never silently merged.
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

To collect official organisation material immediately, independently of the
local SQLite driver:

```bash
SOURCE_SNAPSHOT_DIR=./data/source-snapshots npm run ingest:official
```

To collect public regulator record pages for the three charities and the two
Muslim Aid company candidates:

```bash
SOURCE_SNAPSHOT_DIR=./data/source-snapshots npm run ingest:regulators
```

This is a raw evidence capture step, not a substitute for the richer
Charity Commission extract or authenticated Companies House API. Those remain
the next upgrade when the extract URL and API key are available.

After collection, extract only labelled facts from the saved pages:

```bash
SOURCE_SNAPSHOT_DIR=./data/source-snapshots npm run extract:facts
```

The extractor writes `data/extracted-facts.json`. It is intentionally
conservative: facts are linked to the snapshot filename and source URL, and
unlabelled or ambiguous page content is left out for manual review.

With no API keys configured, the pipeline uses deterministic pilot identifier
fixtures for the three charities and two Muslim Aid-related Companies House
identifiers. Live values must be collected through the configured adapters.

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

## Source and identity guarantees

Source types are `government/regulator verified`, `organisation reported`,
`third-party reported`, and `Zakat Grid derived`.
Every stored snapshot includes source URL, record/document identifier,
observed/retrieved dates, confidence at fact level, and a SHA-256 hash.
`identity_candidates` explicitly retains unresolved relationships between
Charity Commission 1000853, 1176462, Companies House CE012794, and historical
Muslim Aid International company 06537070.

For live annual reports, copy the exact official PDF URL into the matching
environment variable and add it to the adapter target list. Credentials
needed are `COMPANIES_HOUSE_API_KEY`; the Charity Commission extract URL is
versioned and must be copied from its download page. Without those values,
the pipeline remains deterministic but only contains identifier-level facts.

## Collection order

Collect evidence in this order. Do not create a score, map, recommendation,
or AI summary from a later layer until the earlier layer is complete enough
to audit.

1. **Establish identity:** collect the Charity Commission number, Companies
   House number, legal name, status, and historical identifiers for each pilot.
2. **Collect regulator records:** download Charity Commission records and
   Companies House profiles, filings, officers, and accounts where available.
3. **Collect organisation-reported material:** snapshot each official website,
   annual report, audited accounts, impact report, programme page, and
   governance/policy document using an exact URL.
4. **Preserve evidence:** store the original response or document metadata,
   source type, URL, record/document identifier, observed/retrieved dates,
   content hash, and retrieval errors.
5. **Extract facts:** attach each individual fact to one or more source
   snapshots with a confidence value; never replace missing facts with a
   guess.
6. **Resolve identities:** link records only when registration evidence or
   documented review supports the relationship. Keep uncertain candidates in
   `identity_candidates`.
7. **Add Zakat Grid derivations:** calculate shared locations, cause overlap,
   data-quality flags, and coordination candidates only from cited facts.

Third-party reports and ratings are a later, separately labelled layer. They
must never override a regulator record or an organisation's primary document
without an explicit review record.

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
