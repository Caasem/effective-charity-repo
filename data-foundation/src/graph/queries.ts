/**
 * Read-side query layer — this is what the Express backend (or any future
 * service) imports to answer product questions from the knowledge graph.
 * Keeping these as named, typed functions (rather than exposing raw SQL)
 * is what makes this safely embeddable in the main API layer later.
 */
import db from '../db';

export interface ResolvedEntitySummary {
  entity_id: string;
  canonical_name: string;
  entity_type: string;
  linked_sources: { system: string; id: string; confidence: number }[];
}

export function getEntity(entityId: string): ResolvedEntitySummary | null {
  const entity = db.prepare('SELECT * FROM resolved_entities WHERE entity_id = ?').get(entityId) as any;
  if (!entity) return null;
  const links = db
    .prepare('SELECT source_system as system, source_id as id, confidence FROM entity_links WHERE entity_id = ?')
    .all(entityId) as any[];
  return { ...entity, linked_sources: links };
}

/** "Which organisations are already active in this location?" — Sprint 4/9. */
export function findOrganisationsInLocation(locationName: string): ResolvedEntitySummary[] {
  const locationId = 'loc_' + locationName.toLowerCase().replace(/\s+/g, '_');
  const rows = db
    .prepare(
      `SELECT DISTINCT re.entity_id, re.canonical_name, re.entity_type
       FROM graph_edges ge
       JOIN resolved_entities re ON re.entity_id = ge.subject_id
       WHERE ge.predicate = 'operates_in' AND ge.object_id = ?`
    )
    .all(locationId) as any[];
  return rows.map((r) => ({ ...r, linked_sources: [] }));
}

/** "Who else is working on the same cause where I'm active?" — coordination. */
export function findCoordinationCandidates(entityId: string) {
  return db
    .prepare(
      `SELECT re.entity_id, re.canonical_name, re.entity_type, ge.evidence
       FROM graph_edges ge
       JOIN resolved_entities re ON re.entity_id = ge.object_id
       WHERE ge.predicate = 'coordination_candidate' AND ge.subject_id = ?
       UNION
       SELECT re.entity_id, re.canonical_name, re.entity_type, ge.evidence
       FROM graph_edges ge
       JOIN resolved_entities re ON re.entity_id = ge.subject_id
       WHERE ge.predicate = 'coordination_candidate' AND ge.object_id = ?`
    )
    .all(entityId, entityId);
}

/** Network-wide stats for the dashboard hero card. */
export function networkOverview() {
  const entities = db.prepare('SELECT COUNT(*) as n FROM resolved_entities').get() as { n: number };
  const dualRegistered = db
    .prepare(`SELECT COUNT(*) as n FROM resolved_entities WHERE entity_type = 'dual_registered'`)
    .get() as { n: number };
  const locations = db
    .prepare(`SELECT COUNT(DISTINCT object_id) as n FROM graph_edges WHERE predicate = 'operates_in'`)
    .get() as { n: number };
  const coordinationClusters = db
    .prepare(`SELECT COUNT(*) as n FROM graph_edges WHERE predicate = 'coordination_candidate'`)
    .get() as { n: number };
  return {
    resolvedEntities: entities.n,
    dualRegisteredOrgs: dualRegistered.n,
    distinctLocations: locations.n,
    coordinationClusters: coordinationClusters.n,
  };
}
