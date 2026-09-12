export type EvidenceSource = 'Government / regulator' | 'Organisation reported';

export interface PilotProfile {
  id: string;
  name: string;
  registrationNumber: string;
  status: 'Provisional';
  sources: Array<{
    type: EvidenceSource;
    label: string;
    observed: string;
  }>;
  facts: string[];
  gaps: string[];
  identityCandidates?: string[];
}

export const pilotProfiles: PilotProfile[] = [
  {
    id: 'cc_328158',
    name: 'Islamic Relief Worldwide',
    registrationNumber: '328158',
    status: 'Provisional',
    sources: [
      { type: 'Government / regulator', label: 'UK Charity Commission', observed: '12 Sep 2026' },
      { type: 'Organisation reported', label: 'Official website', observed: '12 Sep 2026' },
    ],
    facts: ['Charity Commission record captured', 'Official website snapshot captured'],
    gaps: ['Annual report and audited accounts', 'Live extract fields and financial facts'],
  },
  {
    id: 'cc_1000853',
    name: 'Muslim Aid',
    registrationNumber: '1000853',
    status: 'Provisional',
    sources: [
      { type: 'Government / regulator', label: 'UK Charity Commission', observed: '12 Sep 2026' },
      { type: 'Organisation reported', label: 'Official website', observed: '12 Sep 2026' },
      { type: 'Government / regulator', label: 'Companies House candidates', observed: '12 Sep 2026' },
    ],
    facts: ['Charity Commission record captured', 'Official website snapshot captured'],
    gaps: ['Annual report and audited accounts', 'Manual identity review of related company records'],
    identityCandidates: [
      'CC 1000853 ↔ CC 1176462 · possible name collision · unresolved',
      'CC 1000853 ↔ CH CE012794 · possible registration relationship · unresolved',
      'CC 1000853 ↔ CH 06537070 · historical company candidate · unresolved',
    ],
  },
  {
    id: 'cc_1176462',
    name: 'Human Appeal',
    registrationNumber: '1176462',
    status: 'Provisional',
    sources: [
      { type: 'Government / regulator', label: 'UK Charity Commission', observed: '12 Sep 2026' },
      { type: 'Organisation reported', label: 'Official website', observed: '12 Sep 2026' },
    ],
    facts: ['Charity Commission record captured', 'Official website snapshot captured'],
    gaps: ['Annual report and audited accounts', 'Live extract fields and financial facts'],
  },
];
