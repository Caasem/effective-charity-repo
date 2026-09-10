import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATA_FOUNDATION_DB ?? './data/foundation.sqlite';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db: DatabaseType = new Database(dbPath);
db.pragma('journal_mode = WAL');

/**
 * Schema for the Philanthropy Data Foundation.
 *
 * This is deliberately separate from (but designed to sit alongside) the
 * production `organisations` table in database/schema.sql. Raw source
 * records land in `source_*` tables untouched; entity resolution then
 * produces `resolved_entities` + `entity_links`, which is the join surface
 * the rest of the platform reads from. Nothing here mutates source data,
 * so re-running ingestion is always safe.
 */
db.exec(`
CREATE TABLE IF NOT EXISTS source_charity_commission (
  reg_charity_number   TEXT PRIMARY KEY,
  charity_name         TEXT NOT NULL,
  registration_status  TEXT,
  date_of_registration TEXT,
  date_of_removal      TEXT,
  charity_type         TEXT,
  income                REAL,
  spending              REAL,
  financial_year_end    TEXT,
  operates_in           TEXT, -- JSON array
  classification         TEXT, -- JSON array of what-causes tags
  raw_json               TEXT,
  ingested_at             TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_charity_trustee (
  reg_charity_number TEXT NOT NULL,
  trustee_name        TEXT,
  appointed_date       TEXT,
  FOREIGN KEY (reg_charity_number) REFERENCES source_charity_commission(reg_charity_number)
);

CREATE TABLE IF NOT EXISTS source_companies_house (
  company_number     TEXT PRIMARY KEY,
  company_name       TEXT NOT NULL,
  company_status     TEXT,
  company_type       TEXT,
  date_of_creation   TEXT,
  sic_codes          TEXT, -- JSON array
  registered_address TEXT, -- JSON object
  raw_json           TEXT,
  ingested_at        TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_companies_house_officer (
  company_number TEXT NOT NULL,
  officer_name   TEXT,
  role           TEXT,
  appointed_on   TEXT,
  FOREIGN KEY (company_number) REFERENCES source_companies_house(company_number)
);

-- Entity resolution output: one row per real-world organisation we believe
-- exists, regardless of how many source records describe it.
CREATE TABLE IF NOT EXISTS resolved_entities (
  entity_id      TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  entity_type    TEXT, -- charity | company | dual_registered
  created_at     TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Links a resolved entity back to every source record that describes it,
-- with the confidence score and matching method that produced the link.
CREATE TABLE IF NOT EXISTS entity_links (
  entity_id         TEXT NOT NULL,
  source_system     TEXT NOT NULL, -- 'charity_commission' | 'companies_house'
  source_id         TEXT NOT NULL, -- reg_charity_number | company_number
  confidence        REAL NOT NULL, -- 0..1
  match_method       TEXT NOT NULL, -- 'registration_number' | 'name_exact' | 'name_fuzzy+postcode' | ...
  created_at         TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (entity_id, source_system, source_id),
  FOREIGN KEY (entity_id) REFERENCES resolved_entities(entity_id)
);

-- Knowledge graph edges: generic (subject, predicate, object) triples layered
-- on top of resolved entities, so new relationship types don't need schema
-- migrations. Initiatives, causes and locations from the main product
-- database are referenced by their own IDs as object_id.
CREATE TABLE IF NOT EXISTS graph_edges (
  edge_id     TEXT PRIMARY KEY,
  subject_id  TEXT NOT NULL, -- resolved_entities.entity_id
  predicate   TEXT NOT NULL, -- 'operates_in' | 'classified_as' | 'shares_trustee_with' | 'same_registered_address_as' | ...
  object_id   TEXT NOT NULL,
  object_type TEXT NOT NULL, -- 'location' | 'cause' | 'entity' | 'initiative'
  weight      REAL DEFAULT 1.0,
  evidence    TEXT, -- JSON: what produced this edge
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_edges_subject ON graph_edges(subject_id);
CREATE INDEX IF NOT EXISTS idx_edges_predicate ON graph_edges(predicate);
CREATE INDEX IF NOT EXISTS idx_links_entity ON entity_links(entity_id);
`);

export default db;
