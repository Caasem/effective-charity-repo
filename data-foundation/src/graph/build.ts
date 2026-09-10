/**
 * Builds the knowledge graph edges from resolved entities + their source
 * records. This is what makes the network "intelligent" (Sprint 9 in the
 * roadmap): it's the layer that answers "which organisations operate in
 * the same place" and "which organisations share a trustee" — i.e. the
 * coordination and duplication signals the product is built around.
 */
import crypto from 'crypto';
import db from '../db';

function edgeId(subject: string, predicate: string, object: string): string {
  return 'edge_' + crypto.createHash('sha1').update(`${subject}:${predicate}:${object}`).digest('hex').slice(0, 16);
}

const insertEdge = db.prepare(`
  INSERT OR REPLACE INTO graph_edges (edge_id, subject_id, predicate, object_id, object_type, weight, evidence)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

function buildOperatesInEdges() {
  const rows = db
    .prepare(
      `SELECT el.entity_id, scc.operates_in
       FROM entity_links el
       JOIN source_charity_commission scc ON scc.reg_charity_number = el.source_id
       WHERE el.source_system = 'charity_commission'`
    )
    .all() as { entity_id: string; operates_in: string }[];

  let count = 0;
  for (const r of rows) {
    const locations: string[] = JSON.parse(r.operates_in ?? '[]');
    for (const loc of locations) {
      const locationId = 'loc_' + loc.toLowerCase().replace(/\s+/g, '_');
      insertEdge.run(
        edgeId(r.entity_id, 'operates_in', locationId),
        r.entity_id,
        'operates_in',
        locationId,
        'location',
        1.0,
        JSON.stringify({ source: 'charity_commission', location_name: loc })
      );
      count++;
    }
  }
  return count;
}

function buildClassificationEdges() {
  const rows = db
    .prepare(
      `SELECT el.entity_id, scc.classification
       FROM entity_links el
       JOIN source_charity_commission scc ON scc.reg_charity_number = el.source_id
       WHERE el.source_system = 'charity_commission'`
    )
    .all() as { entity_id: string; classification: string }[];

  let count = 0;
  for (const r of rows) {
    const causes: string[] = JSON.parse(r.classification ?? '[]');
    for (const cause of causes) {
      const causeId = 'cause_' + cause.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      insertEdge.run(
        edgeId(r.entity_id, 'classified_as', causeId),
        r.entity_id,
        'classified_as',
        causeId,
        'cause',
        1.0,
        JSON.stringify({ source: 'charity_commission', cause_name: cause })
      );
      count++;
    }
  }
  return count;
}

/**
 * Coordination signal: entities that operate_in the same location AND are
 * classified under an overlapping cause are flagged as potential
 * duplication/partnership candidates. This is the literal implementation
 * of Sprint 4 ("3 organisations are already active in this area").
 */
function buildCoordinationEdges() {
  const overlaps = db
    .prepare(
      `SELECT a.subject_id as entity_a, b.subject_id as entity_b, a.object_id as location_id
       FROM graph_edges a
       JOIN graph_edges b
         ON a.object_id = b.object_id
        AND a.predicate = 'operates_in' AND b.predicate = 'operates_in'
        AND a.subject_id < b.subject_id`
    )
    .all() as { entity_a: string; entity_b: string; location_id: string }[];

  let count = 0;
  const seen = new Set<string>();
  for (const o of overlaps) {
    const key = `${o.entity_a}|${o.entity_b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    insertEdge.run(
      edgeId(o.entity_a, 'coordination_candidate', o.entity_b),
      o.entity_a,
      'coordination_candidate',
      o.entity_b,
      'entity',
      1.0,
      JSON.stringify({ reason: 'shared_operating_location', location: o.location_id })
    );
    count++;
  }
  return count;
}

function main() {
  db.prepare(`DELETE FROM graph_edges`).run();
  const a = buildOperatesInEdges();
  const b = buildClassificationEdges();
  const c = buildCoordinationEdges();
  console.log(`Built graph: ${a} operates_in edges, ${b} classified_as edges, ${c} coordination_candidate edges.`);

  // Quick sanity readout: show one coordination cluster if any exist
  const sample = db
    .prepare(
      `SELECT ea.canonical_name as a, eb.canonical_name as b, ge.evidence
       FROM graph_edges ge
       JOIN resolved_entities ea ON ea.entity_id = ge.subject_id
       JOIN resolved_entities eb ON eb.entity_id = ge.object_id
       WHERE ge.predicate = 'coordination_candidate'
       LIMIT 5`
    )
    .all();
  if (sample.length) {
    console.log('\nSample coordination candidates:');
    for (const s of sample as any[]) {
      console.log(`  "${s.a}" ⇄ "${s.b}" — ${s.evidence}`);
    }
  }
}

if (require.main === module) main();

export { buildOperatesInEdges, buildClassificationEdges, buildCoordinationEdges };
