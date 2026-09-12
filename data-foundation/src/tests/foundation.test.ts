import assert from 'assert';
import { hashSnapshot, makeSnapshot } from '../provenance';
import { canonicalOrganisation } from '../canonical';
import { normalizeName, nameSimilarity } from '../entity-resolution/match';
import { isGuardedIdentity } from '../entity-resolution/guards';
import { MUSLIM_AID_IDENTITY_CANDIDATES, PILOT_CHARITIES, PILOT_COMPANIES } from '../ingest/fixtures';

assert.strictEqual(normalizeName('Islamic Relief Worldwide Ltd'), 'islamic relief');
assert.strictEqual(nameSimilarity('Muslim Aid', 'MUSLIM AID'), 1);
assert.strictEqual(PILOT_CHARITIES.length, 3);
assert.deepStrictEqual(PILOT_CHARITIES.map((c) => c.reg_charity_number), ['328158', '1000853', '1176462']);
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
assert.strictEqual(canonicalOrganisation('cc_1000853', 'MUSLIM AID', 'charity').status, 'provisional');
assert.strictEqual(MUSLIM_AID_IDENTITY_CANDIDATES.every((candidate) => candidate.status === 'unresolved'), true);
assert.strictEqual(isGuardedIdentity('companies_house', 'CE012794'), true);
assert.strictEqual(isGuardedIdentity('companies_house', '06537070'), true);
assert.strictEqual(isGuardedIdentity('companies_house', '12345678'), false);
console.log('foundation tests passed');
