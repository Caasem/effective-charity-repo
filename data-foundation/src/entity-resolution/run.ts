/**
 * Runs entity resolution across all ingested source records and populates
 * `resolved_entities` + `entity_links`.
 *
 * Strategy:
 *  1. Every charity_commission record becomes (or reuses) a resolved entity.
 *  2. Every companies_house record is matched by fuzzy name against the
 *     charity pool; a hit above threshold links the two sources into one
 *     entity (dual_registered). A miss becomes its own resolved entity
 *     (type: company) — it may be a business partner rather than a charity.
 *
 * Re-running is idempotent: entity IDs are derived deterministically from
 * the lead source record, so re-resolution doesn't fork duplicate entities.
 */
import crypto from 'crypto';
import db from '../db';
import { matchByName } from './match';

function entityIdFor(system: string, id: string): string {
  return 'ent_' + crypto.createHash('sha1').update(`${system}:${id}`).digest('hex').slice(0, 16);
}

const insertEntity = db.prepare(`
  INSERT OR IGNORE INTO resolved_entities (entity_id, canonical_name, entity_type) VALUES (?, ?, ?)
`);
const insertLink = db.prepare(`
  INSERT OR REPLACE INTO entity_links (entity_id, source_system, source_id, confidence, match_method)
  VALUES (?, ?, ?, ?, ?)
`);

function run() {
  const charities = db
    .prepare('SELECT reg_charity_number as id, charity_name as name FROM source_charity_commission')
    .all() as { id: string; name: string }[];
  const companies = db
    .prepare('SELECT company_number as id, company_name as name FROM source_companies_house')
    .all() as { id: string; name: string }[];

  console.log(`Resolving entities: ${charities.length} charity records, ${companies.length} company records.`);

  // 1. every charity is its own entity, keyed off the charity source
  const charityEntityIds = new Map<string, string>();
  for (const c of charities) {
    const entityId = entityIdFor('charity_commission', c.id);
    insertEntity.run(entityId, c.name, 'charity');
    insertLink.run(entityId, 'charity_commission', c.id, 1.0, 'primary_source');
    charityEntityIds.set(c.id, entityId);
  }

  // 2. match companies against charities by name
  const matches = matchByName('companies_house', companies, 'charity_commission', charities, 0.82);
  const matchedCompanyIds = new Set(matches.map((m) => m.sourceA.id));

  for (const m of matches) {
    const entityId = charityEntityIds.get(m.sourceB.id)!;
    insertLink.run(entityId, 'companies_house', m.sourceA.id, m.confidence, m.method);
    // Promote to dual_registered since we now know it's both a charity and a company
    db.prepare(`UPDATE resolved_entities SET entity_type = 'dual_registered' WHERE entity_id = ?`).run(entityId);
    console.log(
      `  linked: "${m.sourceA.name}" (Companies House ${m.sourceA.id}) ⇄ "${m.sourceB.name}" (Charity ${m.sourceB.id}) — confidence ${m.confidence}`
    );
  }

  // 3. unmatched companies become their own entities (likely business partners)
  let newCompanyEntities = 0;
  for (const c of companies) {
    if (matchedCompanyIds.has(c.id)) continue;
    const entityId = entityIdFor('companies_house', c.id);
    insertEntity.run(entityId, c.name, 'company');
    insertLink.run(entityId, 'companies_house', c.id, 1.0, 'primary_source');
    newCompanyEntities++;
  }

  const total = db.prepare('SELECT COUNT(*) as n FROM resolved_entities').get() as { n: number };
  console.log(
    `\nDone. ${matches.length} cross-source matches found. ` +
      `${newCompanyEntities} companies had no charity match (kept separate). ` +
      `${total.n} resolved entities total.`
  );
}

if (require.main === module) run();

export { run };
