/**
 * Data viewer — a small internal tool for looking at what the pipeline has
 * actually collected, per-fact, with its source badge. This is the
 * "Provenance Tag UI" described in PROJECT_BRIEF.md, scoped to research/
 * pilot-building: read-only, no auth, meant to run on localhost against the
 * local SQLite file while iterating on ingestion.
 *
 * Every field returned here is either a direct DB column or a joined
 * source_snapshot — nothing is summarized or inferred, so the frontend can
 * show "where did this come from" for literally everything on screen.
 */
import express from 'express';
import path from 'path';
import db from '../src/db';

const app = express();
const PORT = Number(process.env.VIEWER_PORT ?? 4100);

interface OrgRow {
  organisation_id: string;
  canonical_name: string;
  entity_type: string;
  status: string;
}

function regNumberFromOrgId(organisationId: string): string {
  return organisationId.replace(/^cc_/, '');
}

function resolvedEntityIdFor(regNumber: string): string | null {
  const row = db
    .prepare(
      `SELECT entity_id FROM entity_links WHERE source_system = 'charity_commission' AND source_id = ?`
    )
    .get(regNumber) as { entity_id: string } | undefined;
  return row?.entity_id ?? null;
}

app.get('/api/organisations', (_req, res) => {
  const orgs = db
    .prepare(`SELECT organisation_id, canonical_name, entity_type, status FROM canonical_organisations ORDER BY canonical_name`)
    .all() as OrgRow[];
  const summaries = orgs.map((org) => {
    const reg = regNumberFromOrgId(org.organisation_id);
    const source = db
      .prepare(`SELECT registration_status, income, spending, charity_type FROM source_charity_commission WHERE reg_charity_number = ?`)
      .get(reg) as { registration_status: string | null; income: number | null; spending: number | null; charity_type: string | null } | undefined;
    return { ...org, reg_charity_number: reg, ...source };
  });
  res.json(summaries);
});

app.get('/api/organisations/:id', (req, res) => {
  const organisationId = req.params.id;
  const org = db
    .prepare(`SELECT organisation_id, canonical_name, entity_type, status FROM canonical_organisations WHERE organisation_id = ?`)
    .get(organisationId) as OrgRow | undefined;
  if (!org) {
    res.status(404).json({ error: `No organisation with id ${organisationId}` });
    return;
  }
  const reg = regNumberFromOrgId(organisationId);

  const sourceRecord = db
    .prepare(`SELECT * FROM source_charity_commission WHERE reg_charity_number = ?`)
    .get(reg) as Record<string, unknown> | undefined;

  const facts = db
    .prepare(
      `SELECT f.fact_type, f.fact_value, f.confidence,
              s.source_type, s.source_name, s.source_url, s.observed_at, s.retrieved_at
       FROM organisation_facts f
       JOIN source_snapshots s ON s.snapshot_id = f.source_snapshot_id
       WHERE f.organisation_id = ?
       ORDER BY f.fact_type`
    )
    .all(organisationId);

  const trustees = db
    .prepare(`SELECT trustee_name, appointed_date FROM source_charity_trustee WHERE reg_charity_number = ?`)
    .all(reg);

  const identityCandidates = db
    .prepare(`SELECT * FROM identity_candidates WHERE left_id = ? OR right_id = ?`)
    .all(reg, reg);

  const entityId = resolvedEntityIdFor(reg);
  let operatesIn: unknown[] = [];
  let classifiedAs: unknown[] = [];
  let coordinationCandidates: unknown[] = [];
  if (entityId) {
    operatesIn = db
      .prepare(`SELECT object_id, evidence FROM graph_edges WHERE predicate = 'operates_in' AND subject_id = ? ORDER BY object_id`)
      .all(entityId);
    classifiedAs = db
      .prepare(`SELECT object_id, evidence FROM graph_edges WHERE predicate = 'classified_as' AND subject_id = ? ORDER BY object_id`)
      .all(entityId);
    coordinationCandidates = db
      .prepare(
        `SELECT re.canonical_name, ge.evidence
         FROM graph_edges ge
         JOIN resolved_entities re ON re.entity_id = ge.object_id
         WHERE ge.predicate = 'coordination_candidate' AND ge.subject_id = ?
         UNION
         SELECT re.canonical_name, ge.evidence
         FROM graph_edges ge
         JOIN resolved_entities re ON re.entity_id = ge.subject_id
         WHERE ge.predicate = 'coordination_candidate' AND ge.object_id = ?`
      )
      .all(entityId, entityId);
  }

  res.json({
    organisation: org,
    reg_charity_number: reg,
    source_record: sourceRecord,
    facts,
    trustees,
    identity_candidates: identityCandidates,
    operates_in: operatesIn,
    classified_as: classifiedAs,
    coordination_candidates: coordinationCandidates,
  });
});

app.get('/api/network-overview', (_req, res) => {
  const entities = db.prepare('SELECT COUNT(*) as n FROM resolved_entities').get() as { n: number };
  const locations = db
    .prepare(`SELECT COUNT(DISTINCT object_id) as n FROM graph_edges WHERE predicate = 'operates_in'`)
    .get() as { n: number };
  const coordination = db
    .prepare(`SELECT COUNT(*) as n FROM graph_edges WHERE predicate = 'coordination_candidate'`)
    .get() as { n: number };
  const unresolvedCandidates = db
    .prepare(`SELECT COUNT(*) as n FROM identity_candidates WHERE status = 'unresolved'`)
    .get() as { n: number };
  res.json({
    resolvedEntities: entities.n,
    distinctLocations: locations.n,
    coordinationEdges: coordination.n,
    unresolvedIdentityCandidates: unresolvedCandidates.n,
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Data viewer running at http://localhost:${PORT}`);
});
