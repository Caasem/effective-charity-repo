import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
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

export async function extractFacts(snapshot: SourceSnapshot, snapshotId: string, snapshotDir = '.'): Promise<ExtractedFact[]> {
  const payload = snapshot.raw_json as { body?: string; binary_file?: string };
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
  } else if (snapshot.source_name === 'Organisation website') {
    // Deliberately shallow: pull only what the page states outright, never
    // summarize or interpret its content. `raw` (not the stripped `text`) is
    // used here because <title>/<meta>/<a> extraction needs the markup.
    const raw = payload.body ?? '';

    const titleMatch = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    add('website_title', titleMatch?.[1]?.replace(/\s+/g, ' ').trim(), 1);

    const descMatch = raw.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    add('website_meta_description', descMatch?.[1]?.trim(), 1);

    // The charity's own claimed registration number, if stated on the page —
    // a direct cross-check against the Charity Commission's number, not a guess.
    const charityNumMatch = raw.match(/charity\s*(?:no\.?|number|registration number)\s*:?\s*#?\s*(\d{5,8})/i);
    add('self_reported_charity_number', charityNumMatch?.[1], 1);

    // Links pointing at governance/financial documents, surfaced so an exact
    // document URL can be verified and snapshotted deliberately later — never
    // downloaded or treated as the document itself from this pass alone.
    const linkPattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const seenLinks = new Set<string>();
    let linkMatch: RegExpExecArray | null;
    while ((linkMatch = linkPattern.exec(raw)) && seenLinks.size < 5) {
      const href = linkMatch[1];
      const linkText = linkMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!/annual report|accounts|impact report|trustees.? report|governance/i.test(href + ' ' + linkText)) continue;
      let absolute: string;
      try {
        absolute = new URL(href, snapshot.source_url).toString();
      } catch {
        continue;
      }
      if (seenLinks.has(absolute)) continue;
      seenLinks.add(absolute);
      add('discovered_document_link', `${linkText || '(no link text)'} -> ${absolute}`, 0.9);
    }
  } else if (snapshot.source_name === 'Organisation annual report' && payload.binary_file) {
    // The document itself, not a claim about it. Only what pdf-parse reads
    // back verbatim from the PDF's own text layer — no summarizing.
    const pdfPath = path.join(snapshotDir, payload.binary_file);
    if (fs.existsSync(pdfPath)) {
      try {
        const parsed = await pdfParse(fs.readFileSync(pdfPath));
        add('annual_report_page_count', String(parsed.numpages), 1);
        add('annual_report_cover_text', parsed.text.slice(0, 600).replace(/\s+/g, ' ').trim(), 1);
        // Cross-check: does the document's own stated charity number match
        // the Charity Commission's number for this organisation_id?
        const numMatch = parsed.text.match(/charity\s*registration\s*number\s*:?\s*(\d{5,8})/i);
        add('annual_report_self_reported_charity_number', numMatch?.[1], 1);
      } catch {
        // Parse failure just means fewer facts, never a guessed one.
      }
    }
  }
  add('source_page_captured', snapshot.source_url, 1);
  return facts;
}

export async function extractSnapshotFile(filePath: string): Promise<ExtractedFact[]> {
  const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8')) as SourceSnapshot;
  const snapshotId = path.basename(filePath, '.json');
  return extractFacts(snapshot, snapshotId, path.dirname(filePath));
}
