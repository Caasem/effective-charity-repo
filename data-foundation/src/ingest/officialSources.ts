/**
 * Optional organisation-reported source adapter.
 *
 * Homepage URLs are safe discovery defaults. Annual report URLs must be
 * supplied explicitly because report locations change and guessing would
 * create unverifiable evidence. Failed fetches are reported, never turned
 * into fabricated facts.
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { makeSnapshot, hashBuffer, SourceSnapshot } from '../provenance';
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

/**
 * Annual reports/accounts are binary (almost always PDF). Fetching them with
 * `.text()` — as the website path below does — silently corrupts the bytes
 * via a lossy UTF-8 decode, so `content_hash` would hash mangled content
 * instead of the real document. This fetches as a buffer, hashes the real
 * bytes, and writes them to a sibling file next to the snapshot JSON, which
 * only carries metadata (never the binary itself — JSON isn't a safe
 * container for it).
 */
async function collectBinarySource(target: OfficialSourceTarget): Promise<string> {
  const response = await fetch(target.url, {
    timeout: 30_000,
    headers: { 'User-Agent': 'ZakatGridDataFoundation/0.1 (+auditable charity research)' },
  });
  if (!response.ok) throw new Error(`${target.url} returned HTTP ${response.status}`);
  const buffer = await response.buffer();
  const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
  const contentHash = hashBuffer(buffer);
  const observedAt = new Date().toISOString();
  const directory = process.env.SOURCE_SNAPSHOT_DIR ?? './data/source-snapshots';
  fs.mkdirSync(directory, { recursive: true });
  const binaryFilename = `organisation-annual-report-${target.organisation_id}-${contentHash.slice(0, 12)}.pdf`;
  fs.writeFileSync(path.join(directory, binaryFilename), buffer);
  const snapshot: SourceSnapshot = {
    source_type: 'organisation reported',
    source_name: 'Organisation annual report',
    source_url: target.url,
    record_identifier: target.organisation_id,
    observed_at: observedAt,
    retrieved_at: new Date().toISOString(),
    content_hash: contentHash,
    raw_json: {
      organisation_id: target.organisation_id,
      source_kind: target.source_kind,
      content_type: contentType,
      byte_length: buffer.length,
      binary_file: binaryFilename,
    },
  };
  return writeSnapshot(snapshot);
}

export async function collectOfficialSource(target: OfficialSourceTarget): Promise<string> {
  if (target.source_kind === 'annual_report') {
    return collectBinarySource(target);
  }
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
    'Organisation website',
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
