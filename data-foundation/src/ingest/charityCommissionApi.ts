/**
 * Charity Commission Register of Charities API client (the "beta REST API"
 * referenced but never implemented in `charityCommission.ts` — this is Path
 * 2). Register at https://api-portal.charitycommission.gov.uk/signup, create
 * a subscription, and the portal gives you both a base URL and an
 * `Ocp-Apim-Subscription-Key`. Put the key in `CHARITY_COMMISSION_API_KEY`
 * and the base URL in `CHARITY_COMMISSION_API_BASE_URL` — like the open-data
 * extract URL, the portal's own host isn't a stable well-known value here,
 * so it must be copied from the portal rather than guessed.
 *
 * Routes and field shapes below follow the Commission's own published data
 * dictionary. Only the operations this pipeline currently uses are
 * implemented; the rest of the catalogue (financial breakdowns, governance,
 * regulatory reports, sector-wide aggregates, etc.) follows the same
 * `{route}/{RegisteredNumber}/{suffix}` shape and can be added the same way
 * when a real use for them shows up — this pipeline avoids ingesting data no
 * feature actually consumes.
 */
import dotenv from 'dotenv';
import { proxiedFetch as fetch } from './httpClient';

dotenv.config();

export interface CharityDetailsV2 {
  organisation_number: number;
  reg_charity_number: number;
  group_subsid_suffix: number;
  charity_name: string;
  charity_type?: string;
  insolvent?: boolean;
  in_administration?: boolean;
  reg_status: 'R' | 'RM';
  date_of_registration?: string;
  date_of_removal?: string | null;
  latest_acc_fin_year_end_date?: string | null;
  latest_income?: number | null;
  latest_expenditure?: number | null;
  address_line_one?: string;
  address_post_code?: string;
  phone?: string | null;
  email?: string | null;
  web?: string | null;
  charity_co_reg_number?: string | null;
  reporting_status?: string;
  removal_reason?: string | null;
  cio_ind?: boolean;
  last_modified_time?: string;
  trustee_names?: { trustee_name: string; trustee_id: number }[];
  who_what_where?: { classification_type: string; classification_desc: string }[];
  other_names?: { other_name: string; name_type: 'W' | 'O' }[];
  constituency_name?: string;
}

export interface WhoWhatHowEntry {
  classification_code: string;
  classification_type: 'What' | 'Who' | 'How';
  classification_desc: string;
}

export interface AreaOfOperationEntry {
  area_of_operation: string;
  geographic_area_type: 'Country' | 'Local Authority' | 'Region';
}

export interface FinancialHistoryEntry {
  ar_cycle_reference: string;
  financial_period_end_date: string;
  income: number;
  expenditure: number;
  inc_donations_and_legacies?: number;
  inc_charitable_activities?: number;
  inc_total: number;
  exp_charitable_activities?: number;
  exp_total: number;
}

export interface TrusteeEntry {
  name: string;
  is_chair?: boolean;
  date_of_appointment?: string | null;
  trustee_id: number;
  organisation_number?: number | null;
  charity_name?: string | null;
  reg_charity_number?: number | null;
}

export class CharityCommissionApiError extends Error {}

function requireConfig(): { baseUrl: string; apiKey: string } {
  const baseUrl = process.env.CHARITY_COMMISSION_API_BASE_URL;
  const apiKey = process.env.CHARITY_COMMISSION_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new CharityCommissionApiError(
      'CHARITY_COMMISSION_API_BASE_URL and CHARITY_COMMISSION_API_KEY must both be set — ' +
        'register at https://api-portal.charitycommission.gov.uk/signup, create a subscription, ' +
        'and copy both values from the developer portal. Neither can be guessed or defaulted.'
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

async function get<T>(route: string): Promise<T> {
  const { baseUrl, apiKey } = requireConfig();
  const url = `${baseUrl}/${route}`;
  const res = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': apiKey, Accept: 'application/json' } });
  if (!res.ok) {
    throw new CharityCommissionApiError(
      `Charity Commission API request failed: ${res.status} ${res.statusText} for ${route}. ` +
        `If this is a 401/403, the subscription key may need approval or has expired; if 404, ` +
        `check CHARITY_COMMISSION_API_BASE_URL against the current portal docs.`
    );
  }
  return (await res.json()) as T;
}

/** GetAllCharityDetailsV2 — the richest single-call record for a charity. */
export function getCharityDetailsV2(regNumber: string, suffix = 0): Promise<CharityDetailsV2> {
  return get<CharityDetailsV2>(`allcharitydetailsV2/${regNumber}/${suffix}`);
}

/** GetCharityWhoWhatHow — full classification (What/Who/How) with codes decoded server-side. */
export function getCharityWhoWhatHow(regNumber: string, suffix = 0): Promise<WhoWhatHowEntry[]> {
  return get<WhoWhatHowEntry[]>(`charitywhowhathow/${regNumber}/${suffix}`);
}

/** GetCharityAreaOfOperation — every area of operation with its geographic_area_type. */
export function getCharityAreaOfOperation(regNumber: string, suffix = 0): Promise<AreaOfOperationEntry[]> {
  return get<AreaOfOperationEntry[]>(`charityareaofoperation/${regNumber}/${suffix}`);
}

/** GetCharityFinancialHistory — last 5 years of income/expenditure. */
export function getCharityFinancialHistory(regNumber: string, suffix = 0): Promise<FinancialHistoryEntry[]> {
  return get<FinancialHistoryEntry[]>(`charityfinancialhistory/${regNumber}/${suffix}`);
}

/** GetCharityTrusteeInformationV2 — trustee names, chair flag, cross-charity links. */
export function getCharityTrusteeInformationV2(regNumber: string, suffix = 0): Promise<TrusteeEntry[]> {
  return get<TrusteeEntry[]>(`charitytrusteeinformationv2/${regNumber}/${suffix}`);
}

/** GetCharityConstituency — Westminster constituency of the charity's public contact address. */
export function getCharityConstituency(regNumber: string, suffix = 0): Promise<{ constituency_name: string }> {
  return get<{ constituency_name: string }>(`charityconstituency/${regNumber}/${suffix}`);
}

/** GetSearchCharityByName — free-text charity search (not available via the beta key alone in path 1's extract). */
export interface CharitySearchResult {
  organisation_number: number;
  reg_charity_number: number;
  group_subsid_suffix: number;
  charity_name: string;
  reg_status: 'R' | 'RM';
  date_of_registration?: string;
  date_of_removal?: string | null;
}

export function searchCharityByName(name: string): Promise<CharitySearchResult[]> {
  return get<CharitySearchResult[]>(`searchCharityName/${encodeURIComponent(name)}`);
}
