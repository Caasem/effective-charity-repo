import fs from 'fs';
import path from 'path';
import { SourceSnapshot } from '../provenance';

export interface ExtractedFact {
  fact_type: string;
  fact_value: string;
  confidence: number;
  source_snapshot_id: string;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function labelledValue(text: string, labels: string[]): string | undefined {
  const pattern = new RegExp(`(?:${labels.join('|')})\\s*[:\\-]?\\s*([^|;]{2,120})`, 'i');
  const match = text.match(pattern);
  return match?.[1]?.trim();
}

export function extractFacts(snapshot: SourceSnapshot, snapshotId: string): ExtractedFact[] {
  const payload = snapshot.raw_json as { body?: string };
  const text = htmlToText(payload.body ?? '');
  const facts: ExtractedFact[] = [];
  const add = (fact_type: string, fact_value: string | undefined, confidence = 0.8) => {
    if (fact_value) facts.push({ fact_type, fact_value, confidence, source_snapshot_id: snapshotId });
  };

  if (snapshot.source_name === 'UK Charity Commission') {
    add('registered_name', labelledValue(text, ['Charity name', 'Name']));
    add('registration_status', labelledValue(text, ['Registration status', 'Status']));
    add('date_of_registration', labelledValue(text, ['Date registered', 'Date of registration']));
    add('charity_type', labelledValue(text, ['Charity type', 'What the charity does']));
  } else if (snapshot.source_name === 'Companies House') {
    add('registered_name', labelledValue(text, ['Company name', 'Name']));
    add('company_status', labelledValue(text, ['Company status', 'Status']));
    add('company_type', labelledValue(text, ['Company type', 'Type']));
    add('date_of_creation', labelledValue(text, ['Incorporated on', 'Date of creation']));
  }
  add('source_page_captured', snapshot.source_url, 1);
  return facts;
}

export function extractSnapshotFile(filePath: string): ExtractedFact[] {
  const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8')) as SourceSnapshot;
  const snapshotId = path.basename(filePath, '.json');
  return extractFacts(snapshot, snapshotId);
}
