/**
 * Charity Commission classification reference data ("who/what/how").
 * Source: CCEW Register of Charities API reference data — classification_code
 * is a 3-digit code whose first digit indicates classification_type (1=What,
 * 2=Who, 3=How) and whose last two digits indicate classification_desc.
 *
 * `GetCharityWhoWhatHow` returns classification_code, classification_type and
 * classification_desc directly, so this table is mainly needed to decode the
 * bulk open-data extract, which only returns raw codes/tags.
 */

export type ClassificationType = 'What' | 'Who' | 'How';

export interface Classification {
  classification_code: string;
  classification_type: ClassificationType;
  classification_desc: string;
}

export const CLASSIFICATIONS: Classification[] = [
  { classification_code: '101', classification_type: 'What', classification_desc: 'General charitable purposes' },
  { classification_code: '102', classification_type: 'What', classification_desc: 'Education / training' },
  { classification_code: '103', classification_type: 'What', classification_desc: 'The advancement of health or saving of lives' },
  { classification_code: '104', classification_type: 'What', classification_desc: 'Disability' },
  { classification_code: '105', classification_type: 'What', classification_desc: 'The prevention or relief of poverty' },
  { classification_code: '106', classification_type: 'What', classification_desc: 'Overseas aid / famine relief' },
  { classification_code: '107', classification_type: 'What', classification_desc: 'Accommodation / housing' },
  { classification_code: '108', classification_type: 'What', classification_desc: 'Religious activities' },
  { classification_code: '109', classification_type: 'What', classification_desc: 'Arts / culture / heritage / science' },
  { classification_code: '110', classification_type: 'What', classification_desc: 'Amateur sport' },
  { classification_code: '111', classification_type: 'What', classification_desc: 'Animals' },
  { classification_code: '112', classification_type: 'What', classification_desc: 'Environment / conservation / heritage' },
  { classification_code: '113', classification_type: 'What', classification_desc: 'Economic / community development / employment' },
  { classification_code: '114', classification_type: 'What', classification_desc: 'Armed forces / emergency service efficiency' },
  { classification_code: '115', classification_type: 'What', classification_desc: 'Human rights / religious or racial harmony / equality or diversity' },
  { classification_code: '116', classification_type: 'What', classification_desc: 'Recreation' },
  { classification_code: '117', classification_type: 'What', classification_desc: 'Other charitable purposes' },
  { classification_code: '201', classification_type: 'Who', classification_desc: 'Children / young people' },
  { classification_code: '202', classification_type: 'Who', classification_desc: 'Elderly / old people' },
  { classification_code: '203', classification_type: 'Who', classification_desc: 'People with disabilities' },
  { classification_code: '204', classification_type: 'Who', classification_desc: 'People of a particular ethnic or racial origin' },
  { classification_code: '205', classification_type: 'Who', classification_desc: 'Other charities or voluntary bodies' },
  { classification_code: '206', classification_type: 'Who', classification_desc: 'Other defined groups' },
  { classification_code: '207', classification_type: 'Who', classification_desc: 'The general public / mankind' },
  { classification_code: '301', classification_type: 'How', classification_desc: 'Makes grants to individuals' },
  { classification_code: '302', classification_type: 'How', classification_desc: 'Makes grants to organisations' },
  { classification_code: '303', classification_type: 'How', classification_desc: 'Provides other finance' },
  { classification_code: '304', classification_type: 'How', classification_desc: 'Provides human resources' },
  { classification_code: '305', classification_type: 'How', classification_desc: 'Provides buildings / facilities / open space' },
  { classification_code: '306', classification_type: 'How', classification_desc: 'Provides services' },
  { classification_code: '307', classification_type: 'How', classification_desc: 'Provides advocacy / advice / information' },
  { classification_code: '308', classification_type: 'How', classification_desc: 'Sponsors or undertakes research' },
  { classification_code: '309', classification_type: 'How', classification_desc: 'Acts as an umbrella or resource body' },
  { classification_code: '310', classification_type: 'How', classification_desc: 'Other charitable activities' },
];

const BY_CODE = new Map(CLASSIFICATIONS.map((c) => [c.classification_code, c]));

/**
 * Decode a raw classification code (e.g. "106") into its labelled record.
 * Returns undefined for codes not in the published reference data — callers
 * must not guess a label for those, only pass through the raw code.
 */
export function classificationByCode(code: string): Classification | undefined {
  return BY_CODE.get(String(code).trim());
}

/** Human-readable "Type: Description" label, or the raw code if unrecognised. */
export function classificationLabel(code: string): string {
  const c = classificationByCode(code);
  return c ? `${c.classification_type}: ${c.classification_desc}` : code;
}
