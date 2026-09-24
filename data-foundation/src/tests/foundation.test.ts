import assert from 'assert';
import { hashSnapshot, makeSnapshot } from '../provenance';
import { canonicalOrganisation } from '../canonical';
import { normalizeName, nameSimilarity } from '../entity-resolution/match';
import { isGuardedIdentity } from '../entity-resolution/guards';
import { MUSLIM_AID_IDENTITY_CANDIDATES, PILOT_CHARITIES, PILOT_COMPANIES } from '../ingest/fixtures';
import { extractFacts } from '../ingest/factExtractor';
import { buildProfiles } from '../profiles/buildProfiles';
import { classificationByCode, classificationLabel } from '../referenceData/classifications';
import { classifyAreaOfOperation } from '../referenceData/areaOfOperation';
import { isKnownConstituency } from '../referenceData/constituencies';

assert.strictEqual(normalizeName('Islamic Relief Worldwide Ltd'), 'islamic relief');
assert.strictEqual(nameSimilarity('Muslim Aid', 'MUSLIM AID'), 1);
assert.strictEqual(PILOT_CHARITIES.length, 4);
assert.deepStrictEqual(PILOT_CHARITIES.map((c) => c.reg_charity_number), ['328158', '1176462', '1154288', '1001136']);
assert.deepStrictEqual(PILOT_COMPANIES.map((c) => c.company_number), ['CE012794', '06537070']);

const raw = { company_number: 'CE012794', company_name: 'MUSLIM AID' };
const snapshot = makeSnapshot(
  'government/regulator verified',
  'Companies House',
  'https://find-and-update.company-information.service.gov.uk/company/CE012794',
  'CE012794',
  raw,
  '2026-09-12'
);
assert.strictEqual(snapshot.content_hash, hashSnapshot(raw));
assert.strictEqual(snapshot.record_identifier, 'CE012794');
assert.strictEqual(canonicalOrganisation('cc_1176462', 'MUSLIM AID', 'charity').status, 'provisional');
assert.strictEqual(MUSLIM_AID_IDENTITY_CANDIDATES.every((candidate) => candidate.status === 'unresolved'), true);
assert.strictEqual(isGuardedIdentity('companies_house', 'CE012794'), true);
assert.strictEqual(isGuardedIdentity('companies_house', '06537070'), true);
assert.strictEqual(isGuardedIdentity('companies_house', '12345678'), false);
const extracted = extractFacts(
  {
    source_type: 'government/regulator verified',
    source_name: 'Companies House',
    source_url: 'https://example.test/company/CE012794',
    record_identifier: 'CE012794',
    observed_at: '2026-09-12',
    retrieved_at: '2026-09-12',
    content_hash: 'hash',
    raw_json: { body: '<h1>Company name MUSLIM AID</h1><p>Company status Active</p>' },
  },
  'snapshot-1'
);
assert.strictEqual(extracted.some((fact) => fact.fact_type === 'source_page_captured'), true);
assert.strictEqual(extracted.every((fact) => fact.source_snapshot_id === 'snapshot-1'), true);
const profiles = buildProfiles(extracted, [{
  snapshot_id: 'snapshot-1',
  source_type: 'government/regulator verified',
  source_name: 'Companies House',
  source_url: 'https://example.test/company/CE012794',
  record_identifier: '1176462',
  observed_at: '2026-09-12',
  retrieved_at: '2026-09-12',
  content_hash: 'hash',
}]);
assert.strictEqual(profiles.length, 4);
assert.strictEqual(profiles.find((profile) => profile.charity_commission_number === '1176462')?.identity_candidates?.length, 2);
assert.strictEqual(classificationByCode('106')?.classification_desc, 'Overseas aid / famine relief');
assert.strictEqual(classificationLabel('106'), 'What: Overseas aid / famine relief');
assert.strictEqual(classificationLabel('999'), '999');
assert.strictEqual(classificationByCode('999'), undefined);
assert.strictEqual(classifyAreaOfOperation('Yemen')?.geographic_area_type, 'Country');
assert.strictEqual(classifyAreaOfOperation('Yemen')?.country?.continent, 'Asia');
assert.strictEqual(classifyAreaOfOperation('Tower Hamlets')?.geographic_area_type, 'Local Authority');
assert.strictEqual(classifyAreaOfOperation('Tower Hamlets')?.local_authority?.metropolitan_county, 'Greater London');
assert.strictEqual(classifyAreaOfOperation('Cardiff')?.local_authority?.welsh_ind, true);
assert.strictEqual(classifyAreaOfOperation('Throughout England And Wales')?.geographic_area_type, 'Region');
assert.strictEqual(classifyAreaOfOperation('Narnia'), null);
assert.strictEqual(isKnownConstituency('Bethnal Green and Bow'), true);
assert.strictEqual(isKnownConstituency('Not A Real Constituency'), false);

console.log('foundation tests passed');
