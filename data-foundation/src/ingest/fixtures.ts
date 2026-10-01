/**
 * Deterministic, identifier-only fixtures used when live credentials/download
 * URLs are unavailable. They deliberately do not invent financial or impact
 * facts; live adapters are required to populate those fields.
 *
 * CORRECTION (2026-09-24): the previous fixtures had wrong registration
 * numbers for two of the three pilots, discovered by cross-checking against
 * the live Charity Commission REST API (GetAllCharityDetailsV2):
 *   - '1000853' was labelled "MUSLIM AID" here but is actually
 *     "PRESTON CARICOM ENTERPRISES" (removed charity, unrelated org) — the
 *     number has been dropped, not just relabelled.
 *   - '1176462' was labelled "HUMAN APPEAL" here but is actually the real,
 *     currently registered "MUSLIM AID" (a CIO, registered 2017-12-29).
 *   - Human Appeal's real registration number is '1154288' (a charitable
 *     company, registered 2013-10-21) — it was missing from the fixtures
 *     entirely.
 * Verified via GetSearchCharityByName + GetAllCharityDetailsV2 responses
 * (charity_name, reg_status, date_of_registration all cross-checked).
 */
export const PILOT_CHARITIES = [
  {
    reg_charity_number: '328158',
    charity_name: 'ISLAMIC RELIEF WORLDWIDE',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/328158',
  },
  {
    reg_charity_number: '1176462',
    charity_name: 'MUSLIM AID',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/1176462',
  },
  {
    reg_charity_number: '1154288',
    charity_name: 'HUMAN APPEAL',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/1154288',
  },
  {
    // Registered legal name is exactly "WISE". Added to the registry
    // 2026-09-24; confirmed by registration number directly (the register
    // has 20+ charities whose name starts "WISE ...", so name search alone
    // wasn't enough to be sure which one).
    reg_charity_number: '1001136',
    charity_name: 'WISE',
    source_url: 'https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/1001136',
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

/**
 * CORRECTION (2026-09-24): these candidates were originally anchored to
 * charity number '1000853', which live regulator data revealed to be
 * "Preston Caricom Enterprises" — an unrelated, removed charity with no
 * connection to Muslim Aid. The candidates below are re-anchored to
 * '1176462', the confirmed real Muslim Aid registration (a CIO registered
 * 2017-12-29, per GetAllCharityDetailsV2). The Companies House relationships
 * remain genuinely unresolved: Muslim Aid's live record shows
 * `charity_co_reg_number: null` (CIOs don't carry one), so CE012794 and
 * 06537070 are still only name-based candidates for a predecessor entity,
 * not confirmed — the previous wrong anchor didn't make them any more or
 * less resolved, it just pointed them at the wrong charity.
 */
export const MUSLIM_AID_IDENTITY_CANDIDATES = [
  {
    left_system: 'charity_commission',
    left_id: '1176462',
    right_system: 'companies_house',
    right_id: 'CE012794',
    relationship: 'possible_registration_relationship',
    status: 'unresolved',
    rationale: 'Candidate relationship supplied for pilot investigation; verify against official filings.',
  },
  {
    left_system: 'charity_commission',
    left_id: '1176462',
    right_system: 'companies_house',
    right_id: '06537070',
    relationship: 'historical_company_candidate',
    status: 'unresolved',
    rationale: 'Historical Muslim Aid International company is retained separately pending filings review.',
  },
] as const;
