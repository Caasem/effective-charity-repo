import fs from 'fs';
import path from 'path';
import { extractSnapshotFile } from './factExtractor';

async function main() {
  const inputDirectory = process.env.SOURCE_SNAPSHOT_DIR ?? './data/source-snapshots';
  const outputPath = process.env.EXTRACTED_FACTS_PATH ?? './data/extracted-facts.json';
  const files = fs.existsSync(inputDirectory)
    ? fs.readdirSync(inputDirectory).filter((file) => file.endsWith('.json')).sort()
    : [];
  const factLists = await Promise.all(files.map((file) => extractSnapshotFile(path.join(inputDirectory, file))));
  const facts = factLists.flat();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(facts, null, 2), 'utf8');
  console.log(`Extracted ${facts.length} cited facts from ${files.length} snapshots into ${outputPath}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
