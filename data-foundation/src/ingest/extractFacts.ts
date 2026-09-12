import fs from 'fs';
import path from 'path';
import { extractSnapshotFile } from './factExtractor';

const inputDirectory = process.env.SOURCE_SNAPSHOT_DIR ?? './data/source-snapshots';
const outputPath = process.env.EXTRACTED_FACTS_PATH ?? './data/extracted-facts.json';
const files = fs.existsSync(inputDirectory)
  ? fs.readdirSync(inputDirectory).filter((file) => file.endsWith('.json')).sort()
  : [];
const facts = files.flatMap((file) => extractSnapshotFile(path.join(inputDirectory, file)));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(facts, null, 2), 'utf8');
console.log(`Extracted ${facts.length} cited facts from ${files.length} snapshots into ${outputPath}.`);
