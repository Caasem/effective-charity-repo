export type Urgency = 'critical' | 'high' | 'medium' | 'low';

export interface Need {
  id: string;
  name: string;
  quantityRequired: number;
  quantityFulfilled: number;
  unit: string;
  urgency: Urgency;
}

export interface Initiative {
  id: string;
  title: string;
  emoji: string;
  category: string;
  location: string;
  country: string;
  description: string;
  fundingGoal: number;
  fundingRaised: number;
  donorCount: number;
  urgency: Urgency;
  status: 'active' | 'completed';
  organisationId: string;
  needs: Need[];
  coordinates: { x: number; y: number }; // percent position on map
  partnersActive: number;
}

export interface Organisation {
  id: string;
  name: string;
  type: 'charity' | 'business' | 'ngo';
  logo: string;
  verified: boolean;
  rating: number;
  transparencyScore: number;
  areasOfFocus: string[];
  operatingCountries: string[];
  totalRaised: number;
  activeInitiatives: number;
  foundedYear: number;
  description: string;
}

export const organisations: Organisation[] = [
  {
    id: 'org-1',
    name: 'Islamic Relief Worldwide',
    type: 'charity',
    logo: '🕌',
    verified: true,
    rating: 4.8,
    transparencyScore: 94,
    areasOfFocus: ['Emergency Relief', 'Food Security', 'Healthcare'],
    operatingCountries: ['Sudan', 'Somalia', 'Pakistan', 'Yemen'],
    totalRaised: 1240000,
    activeInitiatives: 8,
    foundedYear: 1984,
    description:
      'International humanitarian and development organisation providing emergency relief and long-term development.',
  },
  {
    id: 'org-2',
    name: 'Muslim Aid',
    type: 'charity',
    logo: '🤲',
    verified: true,
    rating: 4.6,
    transparencyScore: 89,
    areasOfFocus: ['Water & Sanitation', 'Education', 'Orphan Support'],
    operatingCountries: ['Somalia', 'Bangladesh', 'Gaza'],
    totalRaised: 680000,
    activeInitiatives: 5,
    foundedYear: 1985,
    description: 'Delivering sustainable development and emergency relief across the world.',
  },
  {
    id: 'org-3',
    name: 'Penny Appeal',
    type: 'charity',
    logo: '💧',
    verified: true,
    rating: 4.5,
    transparencyScore: 91,
    areasOfFocus: ['Water Wells', 'Winter Aid', 'Qurbani'],
    operatingCountries: ['Pakistan', 'Kenya', 'Gaza'],
    totalRaised: 420000,
    activeInitiatives: 4,
    foundedYear: 2009,
    description: 'Grassroots charity delivering practical, sustainable aid programmes worldwide.',
  },
  {
    id: 'org-4',
    name: 'Birmingham Community Kitchen',
    type: 'charity',
    logo: '🍲',
    verified: true,
    rating: 4.9,
    transparencyScore: 96,
    areasOfFocus: ['Local Food Bank', 'Homelessness', 'Winter Shelter'],
    operatingCountries: ['United Kingdom'],
    totalRaised: 84000,
    activeInitiatives: 2,
    foundedYear: 2016,
    description: 'Local grassroots initiative feeding vulnerable families across Birmingham.',
  },
  {
    id: 'org-5',
    name: 'Al-Amana Logistics',
    type: 'business',
    logo: '🚚',
    verified: true,
    rating: 4.7,
    transparencyScore: 88,
    areasOfFocus: ['Logistics', 'Transport', 'Warehousing'],
    operatingCountries: ['United Kingdom', 'UAE'],
    totalRaised: 0,
    activeInitiatives: 3,
    foundedYear: 2011,
    description: 'Business partner providing logistics and transport capacity to relief operations.',
  },
];

export const initiatives: Initiative[] = [
  {
    id: 'init-1',
    title: 'Emergency Food Distribution',
    emoji: '🍚',
    category: 'Food',
    location: 'Darfur Region',
    country: 'Sudan',
    description:
      'Providing emergency food packages to displaced families across Darfur amid escalating conflict and famine conditions.',
    fundingGoal: 50000,
    fundingRaised: 37500,
    donorCount: 1243,
    urgency: 'critical',
    status: 'active',
    organisationId: 'org-1',
    coordinates: { x: 54, y: 48 },
    partnersActive: 3,
    needs: [
      { id: 'need-1', name: 'Food Packages', quantityRequired: 500, quantityFulfilled: 325, unit: 'packs', urgency: 'critical' },
      { id: 'need-2', name: 'Clean Water (20L)', quantityRequired: 1000, quantityFulfilled: 410, unit: 'containers', urgency: 'critical' },
      { id: 'need-3', name: 'Medical Volunteers', quantityRequired: 12, quantityFulfilled: 4, unit: 'people', urgency: 'high' },
    ],
  },
  {
    id: 'init-2',
    title: 'Gaza Food & Medical Aid',
    emoji: '🏥',
    category: 'Healthcare',
    location: 'Gaza Strip',
    country: 'Palestine',
    description:
      'Delivering critical food supplies and medical aid to families in Gaza facing severe shortages.',
    fundingGoal: 120000,
    fundingRaised: 98200,
    donorCount: 4820,
    urgency: 'critical',
    status: 'active',
    organisationId: 'org-2',
    coordinates: { x: 58, y: 40 },
    partnersActive: 5,
    needs: [
      { id: 'need-4', name: 'Trauma Kits', quantityRequired: 200, quantityFulfilled: 140, unit: 'kits', urgency: 'critical' },
      { id: 'need-5', name: 'Food Parcels', quantityRequired: 2000, quantityFulfilled: 1650, unit: 'parcels', urgency: 'high' },
    ],
  },
  {
    id: 'init-3',
    title: 'Birmingham Winter Shelter',
    emoji: '🏠',
    category: 'Shelter',
    location: 'Birmingham',
    country: 'United Kingdom',
    description:
      'Emergency winter shelter and hot meals for homeless individuals across Birmingham during the coldest months.',
    fundingGoal: 18000,
    fundingRaised: 11400,
    donorCount: 356,
    urgency: 'high',
    status: 'active',
    organisationId: 'org-4',
    coordinates: { x: 48, y: 30 },
    partnersActive: 2,
    needs: [
      { id: 'need-6', name: 'Winter Sleeping Bags', quantityRequired: 150, quantityFulfilled: 90, unit: 'units', urgency: 'high' },
      { id: 'need-7', name: 'Volunteer Cooks', quantityRequired: 20, quantityFulfilled: 13, unit: 'people', urgency: 'medium' },
    ],
  },
  {
    id: 'init-4',
    title: 'Clean Water Wells',
    emoji: '💧',
    category: 'Water',
    location: 'Lower Shabelle',
    country: 'Somalia',
    description:
      'Constructing sustainable water wells to serve drought-affected communities across southern Somalia.',
    fundingGoal: 65000,
    fundingRaised: 28900,
    donorCount: 892,
    urgency: 'high',
    status: 'active',
    organisationId: 'org-3',
    coordinates: { x: 60, y: 52 },
    partnersActive: 2,
    needs: [
      { id: 'need-8', name: 'Well Construction', quantityRequired: 15, quantityFulfilled: 6, unit: 'wells', urgency: 'high' },
      { id: 'need-9', name: 'Water Purification Tablets', quantityRequired: 5000, quantityFulfilled: 3200, unit: 'boxes', urgency: 'medium' },
    ],
  },
  {
    id: 'init-5',
    title: 'Pakistan Flood Education Recovery',
    emoji: '📚',
    category: 'Education',
    location: 'Sindh Province',
    country: 'Pakistan',
    description:
      'Rebuilding flood-damaged schools and providing learning materials to displaced children.',
    fundingGoal: 40000,
    fundingRaised: 15600,
    donorCount: 421,
    urgency: 'medium',
    status: 'active',
    organisationId: 'org-1',
    coordinates: { x: 66, y: 44 },
    partnersActive: 1,
    needs: [
      { id: 'need-10', name: 'Temporary Classrooms', quantityRequired: 25, quantityFulfilled: 8, unit: 'units', urgency: 'medium' },
      { id: 'need-11', name: 'School Supply Kits', quantityRequired: 3000, quantityFulfilled: 1100, unit: 'kits', urgency: 'low' },
    ],
  },
];

export interface Donation {
  id: string;
  initiativeId: string;
  amount: number;
  givingType: 'sadaqah' | 'zakat' | 'waqf' | 'recurring';
  date: string;
  reference: string;
}

export const networkStats = {
  totalCommitted: 2840000,
  activeInitiatives: 126,
  organisations: 48,
  openNeeds: 312,
  volunteers: 1840,
  businesses: 27,
};

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${n.toFixed(0)}`;
}

export function fundingPercent(i: Initiative): number {
  return Math.round((i.fundingRaised / i.fundingGoal) * 100);
}
