/**
 * Charity Commission ingester.
 *
 * Two independent paths, tried in order — see .env.example for how to
 * configure each:
 *
 *  1. CHARITY_COMMISSION_EXTRACT_URL — the daily open-data JSON extract
 *     (no API key required). This is the richer source: it includes
 *     income/spending, classification tags, trustees and operating areas.
 *     The exact download URL is versioned by the Commission and isn't a
 *     stable well-known path, so it has to be copied from
 *     https://register-of-charities.charitycommission.gov.uk/en/register/full-register-download
 *     — if this fails with a 404, that link has almost certainly rotated;
 *     re-copy it.
 *
 *  2. CHARITY_COMMISSION_API_KEY — the beta REST API (register-by-number
 *     lookups only; no free-text search). Useful for refreshing individual
 *     records once you already have a registration number from elsewhere
 *     (e.g. a Companies House dual-registration match).
 *
 * If neither is configured, ingestion falls back to a small bundled sample
 * of real, verifiable UK Muslim charity registrations (their actual
 * registered numbers and names) so the rest of the pipeline has real rows
 * to work with immediately.
 */
import dotenv from 'dotenv';
import db from '../db';
import { makeSnapshot } from '../provenance';
import { canonicalOrganisation } from '../canonical';
import { PILOT_CHARITIES } from './fixtures';
import { proxiedFetch as fetch } from './httpClient';
import {
  getCharityDetailsV2,
  getCharityWhoWhatHow,
  getCharityAreaOfOperation,
  getCharityTrusteeInformationV2,
  getCharityFinancialHistory,
  CharityCommissionApiError,
} from './charityCommissionApi';

dotenv.config();

interface NormalizedCharity {
  reg_charity_number: string;
  charity_name: string;
  registration_status?: string;
  date_of_registration?: string;
  date_of_removal?: string;
  charity_type?: string;
  income?: number;
  spending?: number;
  financial_year_end?: string;
  operates_in?: string[];
  classification?: string[];
  trustees?: string[];
  companies_house_number?: string;
  raw?: unknown;
  source_url?: string;
  observed_at?: string;
}

const upsertCharity = db.prepare(`
  INSERT INTO source_charity_commission
    (reg_charity_number, charity_name, registration_status, date_of_registration, date_of_removal,
     charity_type, income, spending, financial_year_end, operates_in, classification, raw_json)
  VALUES (@reg_charity_number, @charity_name, @registration_status, @date_of_registration, @date_of_removal,
          @charity_type, @income, @spending, @financial_year_end, @operates_in, @classification, @raw_json)
  ON CONFLICT(reg_charity_number) DO UPDATE SET
    charity_name=excluded.charity_name,
    registration_status=excluded.registration_status,
    date_of_registration=excluded.date_of_registration,
    date_of_removal=excluded.date_of_removal,
    charity_type=excluded.charity_type,
    income=excluded.income,
    spending=excluded.spending,
    financial_year_end=excluded.financial_year_end,
    operates_in=excluded.operates_in,
    classification=excluded.classification,
    raw_json=excluded.raw_json,
    ingested_at=CURRENT_TIMESTAMP
`);

const insertTrustee = db.prepare(`
  INSERT INTO source_charity_trustee (reg_charity_number, trustee_name, appointed_date) VALUES (?, ?, ?)
`);

function persist(c: NormalizedCharity) {
  upsertCharity.run({
    reg_charity_number: c.reg_charity_number,
    charity_name: c.charity_name,
    registration_status: c.registration_status ?? null,
    date_of_registration: c.date_of_registration ?? null,
    date_of_removal: c.date_of_removal ?? null,
    charity_type: c.charity_type ?? null,
    income: c.income ?? null,
    spending: c.spending ?? null,
    financial_year_end: c.financial_year_end ?? null,
    operates_in: JSON.stringify(c.operates_in ?? []),
    classification: JSON.stringify(c.classification ?? []),
    raw_json: JSON.stringify(c.raw ?? c),
  });
  if (c.trustees?.length) {
    db.prepare('DELETE FROM source_charity_trustee WHERE reg_charity_number = ?').run(c.reg_charity_number);
    for (const t of c.trustees) insertTrustee.run(c.reg_charity_number, t, null);
  }
  const raw = c.raw ?? c;
  const snapshot = makeSnapshot(
    'government/regulator verified',
    'UK Charity Commission',
    c.source_url ?? `https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/${c.reg_charity_number}`,
    c.reg_charity_number,
    raw,
    c.observed_at ?? new Date().toISOString().slice(0, 10)
  );
  const snapshotId = `cc_${c.reg_charity_number}_${snapshot.content_hash.slice(0, 12)}`;
  db.prepare(`INSERT OR REPLACE INTO source_snapshots
    (snapshot_id, source_type, source_name, source_url, record_identifier, observed_at, retrieved_at, content_hash, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    snapshotId, snapshot.source_type, snapshot.source_name, snapshot.source_url,
    snapshot.record_identifier, snapshot.observed_at, snapshot.retrieved_at,
    snapshot.content_hash, JSON.stringify(snapshot.raw_json)
  );
  const organisationId = `cc_${c.reg_charity_number}`;
  const canonical = canonicalOrganisation(organisationId, c.charity_name, 'charity', Boolean(c.registration_status));
  db.prepare(`INSERT OR REPLACE INTO canonical_organisations
    (organisation_id, canonical_name, entity_type, status) VALUES (?, ?, ?, ?)`).run(
    canonical.organisation_id, canonical.canonical_name, canonical.entity_type, canonical.status
  );
  const fact = db.prepare(`INSERT OR REPLACE INTO organisation_facts
    (fact_id, organisation_id, fact_type, fact_value, source_snapshot_id, confidence)
    VALUES (?, ?, ?, ?, ?, ?)`);
  fact.run(`fact_${organisationId}_name`, organisationId, 'registered_name', c.charity_name, snapshotId, 1);
  fact.run(`fact_${organisationId}_registration_number`, organisationId, 'charity_commission_number', c.reg_charity_number, snapshotId, 1);
  if (c.companies_house_number) {
    // From GetAllCharityDetailsV2.charity_co_reg_number — a confirmed regulator-reported
    // link, not a name-similarity candidate, so it doesn't go through identity_candidates.
    fact.run(`fact_${organisationId}_companies_house_number`, organisationId, 'companies_house_registration_number', c.companies_house_number, snapshotId, 1);
  }
}

/* ---------------------------------------------------------------------- */
/* Path 1: open-data extract                                              */
/* ---------------------------------------------------------------------- */

async function ingestFromExtract(url: string): Promise<number> {
  console.log(`Fetching Charity Commission extract from configured URL...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Extract download failed (${res.status}). The download link on ` +
        `register-of-charities.charitycommission.gov.uk/en/register/full-register-download ` +
        `rotates periodically — re-copy it into CHARITY_COMMISSION_EXTRACT_URL.`
    );
  }
  const json = (await res.json()) as any[];
  let count = 0;
  for (const row of json) {
    // Field names follow the Commission's published data dictionary for the
    // `charity` table; adjust here if they publish a schema revision.
    persist({
      reg_charity_number: String(row.reg_charity_number ?? row.organisation_number),
      charity_name: row.charity_name,
      registration_status: row.charity_registration_status,
      date_of_registration: row.date_of_registration,
      date_of_removal: row.date_of_removal,
      charity_type: row.charity_type,
      income: row.latest_income ? Number(row.latest_income) : undefined,
      spending: row.latest_expenditure ? Number(row.latest_expenditure) : undefined,
      financial_year_end: row.latest_fin_period_end_date,
      raw: row,
    });
    count++;
  }
  return count;
}

/* ---------------------------------------------------------------------- */
/* Path 2: official beta REST API — rich per-charity detail for the       */
/* pilot registration numbers (classification, area of operation,        */
/* trustees, financial history). This is a targeted enrichment step, not */
/* a bulk-population source: it only ever looks up the identifiers       */
/* already in PILOT_CHARITIES, since the API has no free bulk export.    */
/* ---------------------------------------------------------------------- */

const insertFinancialHistory = db.prepare(`
  INSERT OR REPLACE INTO organisation_facts
    (fact_id, organisation_id, fact_type, fact_value, source_snapshot_id, confidence)
  VALUES (?, ?, 'financial_history_year', ?, ?, 1)
`);

async function ingestPilotFromApi(): Promise<number> {
  let enriched = 0;
  for (const pilot of PILOT_CHARITIES) {
    const regNumber = pilot.reg_charity_number;
    try {
      const [details, whoWhatHow, areaOfOperation, trustees, financialHistory] = await Promise.all([
        getCharityDetailsV2(regNumber),
        getCharityWhoWhatHow(regNumber).catch(() => []),
        getCharityAreaOfOperation(regNumber).catch(() => []),
        getCharityTrusteeInformationV2(regNumber).catch(() => []),
        getCharityFinancialHistory(regNumber).catch(() => []),
      ]);

      persist({
        reg_charity_number: regNumber,
        charity_name: details.charity_name,
        registration_status: details.reg_status === 'R' ? 'Registered' : 'Removed',
        date_of_registration: details.date_of_registration,
        date_of_removal: details.date_of_removal ?? undefined,
        charity_type: details.charity_type,
        income: details.latest_income ?? undefined,
        spending: details.latest_expenditure ?? undefined,
        financial_year_end: details.latest_acc_fin_year_end_date ?? undefined,
        operates_in: areaOfOperation.map((a) => a.area_of_operation),
        classification: whoWhatHow.map((w) => `${w.classification_type}: ${w.classification_desc}`),
        trustees: trustees.map((t) => t.name),
        companies_house_number: details.charity_co_reg_number ?? undefined,
        raw: { details, whoWhatHow, areaOfOperation },
        source_url: `https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/${regNumber}`,
      });

      const organisationId = `cc_${regNumber}`;
      const snapshotSuffix = `api_${regNumber}`;
      const financeSnapshot = makeSnapshot(
        'government/regulator verified',
        'UK Charity Commission — GetCharityFinancialHistory',
        `https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/${regNumber}`,
        regNumber,
        financialHistory,
        new Date().toISOString().slice(0, 10)
      );
      const financeSnapshotId = `cc_${snapshotSuffix}_finance_${financeSnapshot.content_hash.slice(0, 12)}`;
      db.prepare(`INSERT OR REPLACE INTO source_snapshots
        (snapshot_id, source_type, source_name, source_url, record_identifier, observed_at, retrieved_at, content_hash, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        financeSnapshotId, financeSnapshot.source_type, financeSnapshot.source_name, financeSnapshot.source_url,
        financeSnapshot.record_identifier, financeSnapshot.observed_at, financeSnapshot.retrieved_at,
        financeSnapshot.content_hash, JSON.stringify(financeSnapshot.raw_json)
      );
      for (const year of financialHistory) {
        insertFinancialHistory.run(
          `fact_${organisationId}_finance_${year.ar_cycle_reference}`,
          organisationId,
          JSON.stringify({
            ar_cycle_reference: year.ar_cycle_reference,
            financial_period_end_date: year.financial_period_end_date,
            income: year.income,
            expenditure: year.expenditure,
          }),
          financeSnapshotId
        );
      }

      console.log(
        `  ✓ ${details.charity_name} (${regNumber}): ${whoWhatHow.length} classifications, ` +
          `${areaOfOperation.length} areas of operation, ${trustees.length} trustees, ` +
          `${financialHistory.length} years of financial history.`
      );
      enriched++;
    } catch (err) {
      if (err instanceof CharityCommissionApiError) throw err;
      console.error(`  ✗ Could not enrich ${pilot.charity_name} (${regNumber}) from the live API: ${(err as Error).message}`);
    }
  }
  return enriched;
}

/* ---------------------------------------------------------------------- */
/* Path 3: bundled real seed data (registration numbers verified real)    */
/* ---------------------------------------------------------------------- */

const SEED_CHARITIES: NormalizedCharity[] = [
  ...PILOT_CHARITIES.map((charity) => ({
    ...charity,
    registration_status: 'Identifier fixture; live record not retrieved',
    raw: charity,
    observed_at: '2026-09-12',
  })),
];

function ingestSeed(): number {
  for (const c of SEED_CHARITIES) persist(c);
  return SEED_CHARITIES.length;
}

/* ---------------------------------------------------------------------- */

async function main() {
  const extractUrl = process.env.CHARITY_COMMISSION_EXTRACT_URL;
  let bulkIngested = 0;

  if (extractUrl) {
    try {
      bulkIngested = await ingestFromExtract(extractUrl);
      console.log(`Ingested ${bulkIngested} charity records from the open-data extract.`);
    } catch (err) {
      console.error(`  ✗ ${(err as Error).message}`);
    }
  } else {
    console.log('CHARITY_COMMISSION_EXTRACT_URL not set — see .env.example for how to get it.');
  }

  const apiConfigured = Boolean(process.env.CHARITY_COMMISSION_API_KEY && process.env.CHARITY_COMMISSION_API_BASE_URL);
  let apiEnriched = 0;
  if (apiConfigured) {
    console.log('\nEnriching pilot charities from the live Charity Commission API...');
    apiEnriched = await ingestPilotFromApi();
  } else {
    console.log(
      '\nCHARITY_COMMISSION_API_KEY / CHARITY_COMMISSION_API_BASE_URL not set — see .env.example. ' +
        'Skipping live per-charity enrichment (classification, area of operation, trustees, financial history).'
    );
  }

  if (bulkIngested === 0 && apiEnriched === 0) {
    console.log('\nNo live source configured. Using bundled seed data (identifiers only) so the rest of the pipeline has real rows to work with.');
    const n = ingestSeed();
    console.log(`Done. Ingested ${n} seed charity records into source_charity_commission.`);
    return;
  }

  console.log(`\nDone. ${bulkIngested} bulk record(s), ${apiEnriched} pilot record(s) enriched from the live API.`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { ingestFromExtract, ingestSeed, ingestPilotFromApi };
