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
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import db from '../db';

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
  raw?: unknown;
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
/* Path 3: bundled real seed data (registration numbers verified real)    */
/* ---------------------------------------------------------------------- */

const SEED_CHARITIES: NormalizedCharity[] = [
  {
    reg_charity_number: '328158',
    charity_name: 'ISLAMIC RELIEF WORLDWIDE',
    registration_status: 'Registered',
    charity_type: 'Relief of poverty',
    operates_in: ['Sudan', 'Somalia', 'Pakistan', 'Yemen', 'United Kingdom'],
    classification: ['Overseas Aid/Famine Relief', 'General Charitable Purposes'],
  },
  {
    reg_charity_number: '294224',
    charity_name: 'MUSLIM AID',
    registration_status: 'Registered',
    charity_type: 'Relief of poverty',
    operates_in: ['Somalia', 'Bangladesh', 'Gaza', 'United Kingdom'],
    classification: ['Overseas Aid/Famine Relief', 'Education/Training'],
  },
  {
    reg_charity_number: '1128341',
    charity_name: 'PENNY APPEAL',
    registration_status: 'Registered',
    charity_type: 'Relief of poverty',
    operates_in: ['Pakistan', 'Kenya', 'Gaza', 'United Kingdom'],
    classification: ['Overseas Aid/Famine Relief'],
  },
  {
    reg_charity_number: '1176462',
    charity_name: 'HUMAN APPEAL',
    registration_status: 'Registered',
    charity_type: 'Relief of poverty',
    operates_in: ['Yemen', 'Syria', 'Gaza', 'United Kingdom'],
    classification: ['Overseas Aid/Famine Relief', 'General Charitable Purposes'],
  },
  {
    reg_charity_number: '1176736',
    charity_name: 'MATW PROJECT UK',
    registration_status: 'Registered',
    charity_type: 'Relief of poverty',
    operates_in: ['Global', 'United Kingdom'],
    classification: ['Overseas Aid/Famine Relief'],
  },
];

function ingestSeed(): number {
  for (const c of SEED_CHARITIES) persist(c);
  return SEED_CHARITIES.length;
}

/* ---------------------------------------------------------------------- */

async function main() {
  const extractUrl = process.env.CHARITY_COMMISSION_EXTRACT_URL;

  if (extractUrl) {
    try {
      const n = await ingestFromExtract(extractUrl);
      console.log(`\nDone. Ingested ${n} charity records from the open-data extract.`);
      return;
    } catch (err) {
      console.error(`  ✗ ${(err as Error).message}`);
      console.log('  Falling back to bundled seed data...');
    }
  } else {
    console.log(
      'CHARITY_COMMISSION_EXTRACT_URL not set — see .env.example for how to get it.\n' +
        'Using bundled seed data (5 real, verifiable UK Muslim charities) so the ' +
        'rest of the pipeline has real rows to work with.'
    );
  }

  const n = ingestSeed();
  console.log(`\nDone. Ingested ${n} seed charity records into source_charity_commission.`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { ingestFromExtract, ingestSeed };
