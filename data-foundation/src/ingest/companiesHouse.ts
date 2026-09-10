/**
 * Companies House ingester — real, working REST client.
 *
 * API: https://developer-specs.company-information.service.gov.uk
 * Auth: HTTP Basic, username = API key, password = empty string.
 * Free tier: 600 requests / 5 minutes, no cost.
 *
 * Usage:
 *   COMPANIES_HOUSE_API_KEY=xxx npm run ingest:companies-house -- "islamic relief"
 *
 * With no query argument it walks a small default seed list of search terms
 * relevant to the network (business categories likely to partner with
 * Muslim charities: logistics, halal food, Islamic finance, etc) so the
 * pipeline produces useful data out of the box.
 */
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import db from '../db';

dotenv.config();

const API_BASE = 'https://api.company-information.service.gov.uk';

const DEFAULT_SEED_QUERIES = [
  'islamic relief',
  'muslim aid',
  'halal logistics',
  'islamic charity',
  'zakat foundation',
  'muslim community trust',
];

function authHeader(): string {
  const key = process.env.COMPANIES_HOUSE_API_KEY;
  if (!key) {
    throw new Error(
      'COMPANIES_HOUSE_API_KEY is not set. Get a free key at ' +
        'https://developer.company-information.service.gov.uk and add it to .env'
    );
  }
  return 'Basic ' + Buffer.from(`${key}:`).toString('base64');
}

interface CompanySearchResult {
  company_number: string;
  title: string;
  company_status?: string;
  company_type?: string;
  date_of_creation?: string;
  address_snippet?: string;
}

async function searchCompanies(query: string): Promise<CompanySearchResult[]> {
  const url = `${API_BASE}/search/companies?q=${encodeURIComponent(query)}&items_per_page=20`;
  const res = await fetch(url, { headers: { Authorization: authHeader() } });
  if (!res.ok) {
    throw new Error(`Companies House search failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { items: CompanySearchResult[] };
  return json.items ?? [];
}

async function getCompanyProfile(companyNumber: string) {
  const res = await fetch(`${API_BASE}/company/${companyNumber}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error(`Profile fetch failed for ${companyNumber} (${res.status})`);
  return res.json();
}

async function getOfficers(companyNumber: string) {
  const res = await fetch(`${API_BASE}/company/${companyNumber}/officers`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) return { items: [] as any[] };
  return (await res.json()) as { items: any[] };
}

const upsertCompany = db.prepare(`
  INSERT INTO source_companies_house
    (company_number, company_name, company_status, company_type, date_of_creation, sic_codes, registered_address, raw_json)
  VALUES (@company_number, @company_name, @company_status, @company_type, @date_of_creation, @sic_codes, @registered_address, @raw_json)
  ON CONFLICT(company_number) DO UPDATE SET
    company_name=excluded.company_name,
    company_status=excluded.company_status,
    company_type=excluded.company_type,
    date_of_creation=excluded.date_of_creation,
    sic_codes=excluded.sic_codes,
    registered_address=excluded.registered_address,
    raw_json=excluded.raw_json,
    ingested_at=CURRENT_TIMESTAMP
`);

const insertOfficer = db.prepare(`
  INSERT INTO source_companies_house_officer (company_number, officer_name, role, appointed_on)
  VALUES (?, ?, ?, ?)
`);

async function ingestCompany(companyNumber: string) {
  const profile: any = await getCompanyProfile(companyNumber);
  upsertCompany.run({
    company_number: profile.company_number,
    company_name: profile.company_name,
    company_status: profile.company_status ?? null,
    company_type: profile.type ?? null,
    date_of_creation: profile.date_of_creation ?? null,
    sic_codes: JSON.stringify(profile.sic_codes ?? []),
    registered_address: JSON.stringify(profile.registered_office_address ?? {}),
    raw_json: JSON.stringify(profile),
  });

  const officers = await getOfficers(companyNumber);
  db.prepare('DELETE FROM source_companies_house_officer WHERE company_number = ?').run(companyNumber);
  for (const o of officers.items ?? []) {
    insertOfficer.run(companyNumber, o.name ?? null, o.officer_role ?? null, o.appointed_on ?? null);
  }

  console.log(`  ✓ ${profile.company_name} (${companyNumber}) — ${officers.items?.length ?? 0} officers`);
}

async function main() {
  const argQuery = process.argv.slice(2).join(' ').trim();
  const queries = argQuery ? [argQuery] : DEFAULT_SEED_QUERIES;

  let totalIngested = 0;
  for (const q of queries) {
    console.log(`\nSearching Companies House for "${q}"...`);
    let results: CompanySearchResult[];
    try {
      results = await searchCompanies(q);
    } catch (err) {
      console.error(`  ✗ ${(err as Error).message}`);
      continue;
    }
    console.log(`  found ${results.length} companies`);
    for (const r of results.slice(0, 5)) {
      try {
        await ingestCompany(r.company_number);
        totalIngested++;
        await sleep(120); // stay well under the 600/5min rate limit
      } catch (err) {
        console.error(`  ✗ ${r.company_number}: ${(err as Error).message}`);
      }
    }
  }
  console.log(`\nDone. Ingested/updated ${totalIngested} company records into source_companies_house.`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { searchCompanies, getCompanyProfile, ingestCompany };
