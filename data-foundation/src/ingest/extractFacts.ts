import fs from 'fs';
import path from 'path';
import { extractSnapshotFile } from './factExtractor';
import { SourceSnapshot } from '../provenance';
import db from '../db';

/**
 * Snapshots collected via officialSources.ts/regulatorSources.ts are only
 * ever written to disk (writeSnapshot) — they never reach the SQLite
 * source_snapshots/organisation_facts tables the viewer and artifact export
 * actually read from. This step closes that gap: load every snapshot file
 * into source_snapshots, extract its facts, and load those into
 * organisation_facts, so website/annual-report/regulator-page work is
 * actually visible anywhere downstream instead of sitting only in
 * extracted-facts.json.
 */
const upsertSnapshot = db.prepare(`
  INSERT OR REPLACE INTO source_snapshots
    (snapshot_id, source_type, source_name, source_url, record_identifier, observed_at, retrieved_at, content_hash, raw_json)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const upsertFact = db.prepare(`
  INSERT OR REPLACE INTO organisation_facts
    (fact_id, organisation_id, fact_type, fact_value, source_snapshot_id, confidence)
  VALUES (?, ?, ?, ?, ?, ?)
`);

async function main() {
  const inputDirectory = process.env.SOURCE_SNAPSHOT_DIR ?? './data/source-snapshots';
  const outputPath = process.env.EXTRACTED_FACTS_PATH ?? './data/extracted-facts.json';
  const files = fs.existsSync(inputDirectory)
    ? fs.readdirSync(inputDirectory).filter((file) => file.endsWith('.json')).sort()
    : [];

  const factLists = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(inputDirectory, file);
      const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8')) as SourceSnapshot;
      const snapshotId = path.basename(file, '.json');

      upsertSnapshot.run(
        snapshotId,
        snapshot.source_type,
        snapshot.source_name,
        snapshot.source_url,
        snapshot.record_identifier,
        snapshot.observed_at,
        snapshot.retrieved_at,
        snapshot.content_hash,
        JSON.stringify(snapshot.raw_json)
      );

      const facts = await extractSnapshotFile(filePath);
      // record_identifier for website/annual-report/regulator-page snapshots
      // is already the organisation_id (cc_XXXXX) — set that way in
      // officialSources.ts/regulatorSources.ts.
      const organisationId = snapshot.record_identifier;
      facts.forEach((fact, i) => {
        upsertFact.run(`fact_${snapshotId}_${i}`, organisationId, fact.fact_type, fact.fact_value, snapshotId, fact.confidence);
      });

      return facts;
    })
  );

  const facts = factLists.flat();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(facts, null, 2), 'utf8');
  console.log(
    `Extracted ${facts.length} cited facts from ${files.length} snapshots into ${outputPath} ` +
      `and loaded them into organisation_facts.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
