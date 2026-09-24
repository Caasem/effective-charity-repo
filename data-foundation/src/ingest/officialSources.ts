/**
 * Optional organisation-reported source adapter.
 *
 * Homepage URLs are safe discovery defaults. Annual report URLs must be
 * supplied explicitly because report locations change and guessing would
 * create unverifiable evidence. Failed fetches are reported, never turned
 * into fabricated facts.
 */
import dotenv from 'dotenv';
import { makeSnapshot } from '../provenance';
import { writeSnapshot } from './snapshotStore';
import { proxiedFetch as fetch } from './httpClient';

dotenv.config();

export interface OfficialSourceTarget {
  organisation_id: string;
  url: string;
  source_kind: 'website' | 'annual_report';
}

export const DEFAULT_OFFICIAL_TARGETS: OfficialSourceTarget[] = [
  { organisation_id: 'cc_328158', url: 'https://www.islamic-relief.org.uk/', source_kind: 'website' },
  { organisation_id: 'cc_1176462', url: 'https://www.muslimaid.org/', source_kind: 'website' },
  { organisation_id: 'cc_1154288', url: 'https://humanappeal.org.uk/', source_kind: 'website' },
];

export async function collectOfficialSource(target: OfficialSourceTarget): Promise<string> {
  const response = await fetch(target.url, {
    timeout: 20_000,
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'ZakatGridDataFoundation/0.1 (+auditable charity research)',
    },
  });
  if (!response.ok) throw new Error(`${target.url} returned HTTP ${response.status}`);
  const body = await response.text();
  const observedAt = new Date().toISOString();
  const snapshot = makeSnapshot(
    'organisation reported',
    target.source_kind === 'annual_report' ? 'Organisation annual report' : 'Organisation website',
    target.url,
    target.organisation_id,
    { organisation_id: target.organisation_id, source_kind: target.source_kind, body },
    observedAt
  );
  const outputPath = writeSnapshot(snapshot);
  return outputPath;
}

export async function collectOfficialSources(targets = DEFAULT_OFFICIAL_TARGETS): Promise<void> {
  const annualReportTargets: OfficialSourceTarget[] = [
    ['ISLAMIC_RELIEF_ANNUAL_REPORT_URL', 'cc_328158'],
    ['MUSLIM_AID_ANNUAL_REPORT_URL', 'cc_1176462'],
    ['HUMAN_APPEAL_ANNUAL_REPORT_URL', 'cc_1154288'],
  ].flatMap(([envName, organisation_id]) => {
    const url = process.env[envName];
    return url ? [{ organisation_id, url, source_kind: 'annual_report' as const }] : [];
  });
  for (const target of [...targets, ...annualReportTargets]) {
    try {
      const snapshotId = await collectOfficialSource(target);
      console.log(`  ✓ ${target.url} (${snapshotId})`);
    } catch (error) {
      console.error(`  ✗ ${target.url}: ${(error as Error).message}`);
    }
  }
}

if (require.main === module) {
  collectOfficialSources().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
