import crypto from 'crypto';

export type SourceType =
  | 'government/regulator verified'
  | 'organisation reported'
  | 'third-party reported'
  | 'Zakat Grid derived';

export interface SourceSnapshot {
  source_type: SourceType;
  source_name: string;
  source_url: string;
  record_identifier: string;
  observed_at: string;
  retrieved_at: string;
  content_hash: string;
  raw_json: unknown;
}

export function hashSnapshot(raw: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(raw)).digest('hex');
}

/** For binary content (PDFs, images) — hashing the real bytes, not a lossy text decode of them. */
export function hashBuffer(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function makeSnapshot(
  source_type: SourceType,
  source_name: string,
  source_url: string,
  record_identifier: string,
  raw_json: unknown,
  observed_at: string
): SourceSnapshot {
  return {
    source_type,
    source_name,
    source_url,
    record_identifier,
    observed_at,
    retrieved_at: new Date().toISOString(),
    content_hash: hashSnapshot(raw_json),
    raw_json,
  };
}
