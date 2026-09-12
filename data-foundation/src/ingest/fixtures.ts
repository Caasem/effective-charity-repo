/**
 * Deterministic, identifier-only fixtures used when live credentials/download
 * URLs are unavailable. They deliberately do not invent financial or impact
 * facts; live adapters are required to populate those fields.
 */
export const PILOT_CHARITIES = [
  {
    reg_charity_number: '328158',
    charity_name: 'ISLAMIC RELIEF WORLDWIDE',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/328158',
  },
  {
    reg_charity_number: '1000853',
    charity_name: 'MUSLIM AID',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/1000853',
  },
  {
    reg_charity_number: '1176462',
    charity_name: 'HUMAN APPEAL',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/1176462',
  },
] as const;

export const PILOT_COMPANIES = [
  {
    company_number: 'CE012794',
    company_name: 'MUSLIM AID',
    source_url: 'https://find-and-update.company-information.service.gov.uk/company/CE012794',
  },
  {
    company_number: '06537070',
    company_name: 'MUSLIM AID INTERNATIONAL',
    source_url: 'https://find-and-update.company-information.service.gov.uk/company/06537070',
  },
] as const;

export const MUSLIM_AID_IDENTITY_CANDIDATES = [
  {
    left_system: 'charity_commission',
    left_id: '1000853',
    right_system: 'charity_commission',
    right_id: '1176462',
    relationship: 'possible_name_collision',
    status: 'unresolved',
    rationale: 'Both identifiers require manual review; no automatic merge is permitted.',
  },
  {
    left_system: 'charity_commission',
    left_id: '1000853',
    right_system: 'companies_house',
    right_id: 'CE012794',
    relationship: 'possible_registration_relationship',
    status: 'unresolved',
    rationale: 'Candidate relationship supplied for pilot investigation; verify against official filings.',
  },
  {
    left_system: 'charity_commission',
    left_id: '1000853',
    right_system: 'companies_house',
    right_id: '06537070',
    relationship: 'historical_company_candidate',
    status: 'unresolved',
    rationale: 'Historical Muslim Aid International company is retained separately pending filings review.',
  },
] as const;
