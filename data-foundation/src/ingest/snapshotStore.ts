import fs from 'fs';
import path from 'path';
import { SourceSnapshot } from '../provenance';

export function writeSnapshot(snapshot: SourceSnapshot, directory = process.env.SOURCE_SNAPSHOT_DIR ?? './data/source-snapshots'): string {
  fs.mkdirSync(directory, { recursive: true });
  const filename = `${snapshot.source_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${snapshot.record_identifier}-${snapshot.content_hash.slice(0, 12)}.json`;
  const outputPath = path.join(directory, filename);
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf8');
  return outputPath;
}
