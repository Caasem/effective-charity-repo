import fetch from 'node-fetch';
import { makeSnapshot } from '../provenance';
import { writeSnapshot } from './snapshotStore';

export interface RegulatorTarget {
  source_name: string;
  source_url: string;
  record_identifier: string;
}

export const PILOT_REGULATOR_TARGETS: RegulatorTarget[] = [
  {
    source_name: 'UK Charity Commission',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/328158',
    record_identifier: '328158',
  },
  {
    source_name: 'UK Charity Commission',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/1000853',
    record_identifier: '1000853',
  },
  {
    source_name: 'UK Charity Commission',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/1176462',
    record_identifier: '1176462',
  },
  {
    source_name: 'Companies House',
    source_url: 'https://find-and-update.company-information.service.gov.uk/company/CE012794',
    record_identifier: 'CE012794',
  },
  {
    source_name: 'Companies House',
    source_url: 'https://find-and-update.company-information.service.gov.uk/company/06537070',
    record_identifier: '06537070',
  },
];

export async function collectRegulatorSource(target: RegulatorTarget): Promise<string> {
  const response = await fetch(target.source_url, {
    timeout: 20_000,
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'ZakatGridDataFoundation/0.1 (+auditable charity research)',
    },
  });
  if (!response.ok) throw new Error(`${target.source_url} returned HTTP ${response.status}`);
  const body = await response.text();
  const observedAt = new Date().toISOString();
  const snapshot = makeSnapshot(
    'government/regulator verified',
    target.source_name,
    target.source_url,
    target.record_identifier,
    { record_identifier: target.record_identifier, body },
    observedAt
  );
  return writeSnapshot(snapshot);
}

export async function collectRegulatorSources(
  targets = PILOT_REGULATOR_TARGETS
): Promise<void> {
  for (const target of targets) {
    try {
      console.log(`  ✓ ${target.record_identifier} (${await collectRegulatorSource(target)})`);
    } catch (error) {
      console.error(`  ✗ ${target.record_identifier}: ${(error as Error).message}`);
    }
  }
}

if (require.main === module) {
  collectRegulatorSources().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
