export interface CanonicalOrganisation {
  organisation_id: string;
  canonical_name: string;
  entity_type: 'charity' | 'company' | 'dual_registered';
  status: 'provisional' | 'verified';
}

export interface OrganisationFact {
  organisation_id: string;
  fact_type: string;
  fact_value: string;
  source_snapshot_id: string;
  confidence: number;
}

export function canonicalOrganisation(
  organisationId: string,
  name: string,
  entityType: CanonicalOrganisation['entity_type'],
  verified = false
): CanonicalOrganisation {
  return {
    organisation_id: organisationId,
    canonical_name: name,
    entity_type: entityType,
    status: verified ? 'verified' : 'provisional',
  };
}
