import fs from 'fs';
import path from 'path';
import { MUSLIM_AID_IDENTITY_CANDIDATES, PILOT_CHARITIES } from '../ingest/fixtures';
import { ExtractedFact } from '../ingest/factExtractor';

interface SnapshotMetadata {
  snapshot_id: string;
  source_type: string;
  source_name: string;
  source_url: string;
  record_identifier: string;
  observed_at: string;
  retrieved_at: string;
  content_hash: string;
}

interface PilotProfile {
  organisation_id: string;
  canonical_name: string;
  charity_commission_number: string;
  status: 'provisional';
  facts: ExtractedFact[];
  sources: SnapshotMetadata[];
  gaps: string[];
  identity_candidates?: typeof MUSLIM_AID_IDENTITY_CANDIDATES;
}

const snapshotDirectory = process.env.SOURCE_SNAPSHOT_DIR ?? './data/source-snapshots';
const outputDirectory = process.env.PROFILE_OUTPUT_DIR ?? './data/profiles';
const factsPath = process.env.EXTRACTED_FACTS_PATH ?? './data/extracted-facts.json';

function readSnapshots(): SnapshotMetadata[] {
  if (!fs.existsSync(snapshotDirectory)) return [];
  return fs
    .readdirSync(snapshotDirectory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => {
      const snapshot = JSON.parse(fs.readFileSync(path.join(snapshotDirectory, file), 'utf8'));
      return {
        snapshot_id: path.basename(file, '.json'),
        source_type: snapshot.source_type,
        source_name: snapshot.source_name,
        source_url: snapshot.source_url,
        record_identifier: snapshot.record_identifier,
        observed_at: snapshot.observed_at,
        retrieved_at: snapshot.retrieved_at,
        content_hash: snapshot.content_hash,
      };
    });
}

export function buildProfiles(
  facts: ExtractedFact[],
  snapshots: SnapshotMetadata[]
): PilotProfile[] {
  return PILOT_CHARITIES.map((charity) => {
    const matchingSnapshots = snapshots.filter(
      (snapshot) =>
        snapshot.record_identifier === charity.reg_charity_number ||
        snapshot.source_url.toLowerCase().includes(charity.charity_name.toLowerCase().split(' ')[0])
    );
    const matchingSnapshotIds = new Set(matchingSnapshots.map((snapshot) => snapshot.snapshot_id));
    const profileFacts = facts.filter((fact) => matchingSnapshotIds.has(fact.source_snapshot_id));
    return {
      organisation_id: `cc_${charity.reg_charity_number}`,
      canonical_name: charity.charity_name,
      charity_commission_number: charity.reg_charity_number,
      status: 'provisional',
      facts: profileFacts,
      sources: matchingSnapshots,
      gaps: [
        'Live Charity Commission extract fields have not yet been imported.',
        'Annual report and audited accounts have not yet been supplied as exact document URLs.',
        'Identity links remain provisional until registration evidence is reviewed.',
      ],
      ...(charity.reg_charity_number === '1176462'
        ? { identity_candidates: MUSLIM_AID_IDENTITY_CANDIDATES }
        : {}),
    };
  });
}

if (require.main === module) {
  const facts = fs.existsSync(factsPath)
    ? (JSON.parse(fs.readFileSync(factsPath, 'utf8')) as ExtractedFact[])
    : [];
  const profiles = buildProfiles(facts, readSnapshots());
  fs.mkdirSync(outputDirectory, { recursive: true });
  for (const profile of profiles) {
    fs.writeFileSync(
      path.join(outputDirectory, `${profile.organisation_id}.json`),
      JSON.stringify(profile, null, 2),
      'utf8'
    );
  }
  console.log(`Built ${profiles.length} provisional pilot profiles in ${outputDirectory}.`);
}
