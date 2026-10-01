/**
 * Charity Commission "Area of Operation" reference data.
 *
 * Mirrors `GetCharityAoOLocalAuthority` / `GetCharityAoORegion` /
 * `GetCharityAoOCountryContinent` / `GetCharityAreaOfOperation`. A charity
 * selects either up to 10 local authority areas OR a region within England &
 * Wales (never both), plus any number of countries outside England & Wales.
 *
 * This is what lets the ingester tell a "local authority" from a "region"
 * from a "country" when decoding the bulk extract's `operates_in` array (the
 * extract gives area names only, not the geographic_area_type the live API
 * returns) — and lets it flag a value the Commission doesn't recognise
 * instead of silently treating it as a valid operating location.
 */

export type GeographicAreaType = 'Local Authority' | 'Region' | 'Country';

export interface LocalAuthority {
  local_authority: string;
  metropolitan_county: string | null;
  welsh_ind: boolean;
}

export const REGIONS: string[] = [
  'Throughout England',
  'Throughout England And Wales',
  'Throughout London',
  'Throughout Wales',
];

const nonMetropolitan = (names: string[]): LocalAuthority[] =>
  names.map((local_authority) => ({ local_authority, metropolitan_county: null, welsh_ind: false }));

const welsh = (names: string[]): LocalAuthority[] =>
  names.map((local_authority) => ({ local_authority, metropolitan_county: null, welsh_ind: true }));

const metropolitan = (metropolitan_county: string, names: string[]): LocalAuthority[] =>
  names.map((local_authority) => ({ local_authority, metropolitan_county, welsh_ind: false }));

export const LOCAL_AUTHORITIES: LocalAuthority[] = [
  ...nonMetropolitan([
    'Bracknell Forest', 'West Berkshire', 'Reading', 'Slough', 'Windsor And Maidenhead', 'Wokingham',
    'Nottingham City', 'Central Bedfordshire', 'Buckinghamshire', 'Cambridgeshire', 'Cheshire East',
    'Cornwall', 'Cumbria', 'Derbyshire', 'Devon', 'Dorset', 'Durham', 'East Sussex', 'Essex',
    'Gloucestershire', 'Hampshire', 'Hertfordshire', 'Isle Of Wight', 'Kent', 'Lancashire',
    'Leicestershire', 'Lincolnshire', 'Norfolk', 'North Yorkshire', 'Northamptonshire',
    'Northumberland', 'Nottinghamshire', 'Oxfordshire', 'Shropshire', 'Somerset', 'Staffordshire',
    'Suffolk', 'Surrey', 'Warwickshire', 'West Sussex', 'Wiltshire', 'North Somerset',
    'Bath And North East Somerset', 'South Gloucestershire', 'Bristol City', 'Hartlepool',
    'Middlesbrough', 'Redcar And Cleveland', 'Stockton-on-tees', 'Kingston Upon Hull City',
    'North Lincolnshire', 'North East Lincolnshire', 'East Riding Of Yorkshire', 'Luton',
    'Milton Keynes', 'Derby City', 'Bournemouth', 'Poole', 'Darlington', 'Brighton And Hove',
    'Southampton City', 'Portsmouth City', 'Leicester City', 'Rutland', 'Stoke-on-trent City',
    'Swindon', 'Blackburn With Darwen', 'Blackpool', 'Southend-on-sea', 'Telford & Wrekin',
    'Peterborough City', 'Herefordshire', 'Worcestershire', 'Medway', 'Isles Of Scilly', 'Torbay',
    'Cheshire West & Chester', 'Bedford', 'Plymouth City', 'Thurrock', 'Halton', 'City Of York',
    'Warrington',
  ]),
  ...welsh([
    'Rhondda Cynon Taff', 'Torfaen', 'Gwynedd', 'Wrexham', 'City Of Swansea', 'Vale Of Glamorgan',
    'Conwy', 'Isle Of Anglesey', 'Blaenau Gwent', 'Bridgend', 'Caerphilly', 'Cardiff', 'Ceredigion',
    'Carmarthenshire', 'Denbighshire', 'Flintshire', 'Merthyr Tydfil', 'Monmouthshire',
    'Neath Port Talbot', 'Newport City', 'Pembrokeshire', 'Powys',
  ]),
  ...metropolitan('Greater London', [
    'Barking And Dagenham', 'Barnet', 'Bexley', 'Brent', 'Bromley', 'Camden', 'City Of London',
    'City Of Westminster', 'Croydon', 'Ealing', 'Enfield', 'Greenwich', 'Hackney',
    'Hammersmith And Fulham', 'Haringey', 'Harrow', 'Havering', 'Hillingdon', 'Hounslow',
    'Islington', 'Kensington And Chelsea', 'Kingston Upon Thames', 'Lambeth', 'Lewisham', 'Merton',
    'Newham', 'Redbridge', 'Richmond Upon Thames', 'Southwark', 'Sutton', 'Tower Hamlets',
    'Waltham Forest', 'Wandsworth',
  ]),
  ...metropolitan('Greater Manchester', [
    'Bolton', 'Bury', 'Manchester City', 'Oldham', 'Rochdale', 'Salford City', 'Stockport',
    'Tameside', 'Trafford', 'Wigan',
  ]),
  ...metropolitan('Merseyside', ['Knowsley', 'Liverpool City', 'Sefton', 'St Helens', 'Wirral']),
  ...metropolitan('South Yorkshire', ['Barnsley', 'Doncaster', 'Rotherham', 'Sheffield City']),
  ...metropolitan('Tyne And Wear', [
    'Gateshead', 'Newcastle Upon Tyne City', 'North Tyneside', 'South Tyneside', 'Sunderland',
  ]),
  ...metropolitan('West Midlands', [
    'Birmingham City', 'Coventry City', 'Dudley', 'Sandwell', 'Solihull', 'Walsall', 'Wolverhampton',
  ]),
  ...metropolitan('West Yorkshire', [
    'Bradford City', 'Calderdale', 'Kirklees', 'Leeds City', 'City Of Wakefield',
  ]),
];

export interface CountryEntry {
  country: string;
  continent: string;
}

const withContinent = (continent: string, names: string[]): CountryEntry[] =>
  names.map((country) => ({ country, continent }));

export const COUNTRIES: CountryEntry[] = [
  ...withContinent('Africa', [
    'Algeria', 'Angola', 'Ascension', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon',
    'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Congo (Democratic Republic)', 'Djibouti',
    'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Ghana', 'Guinea',
    'Guinea-bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi',
    'Mali', 'Mauritania', 'Mauritius', 'Mayotte', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
    'Nigeria', 'Réunion', 'Rwanda', 'Saint Helena', 'São Tomé And Principe', 'Senegal', 'Seychelles',
    'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'The Gambia',
    'Togo', 'Tristan Da Cunha', 'Tunisia', 'Uganda', 'Western Sahara', 'Zambia', 'Zimbabwe',
  ]),
  ...withContinent('Antarctica', [
    'Antarctica', 'Bouvet Island', 'British Antarctic Territory', 'French Southern Territories',
    'Heard Island And Mcdonald Islands',
  ]),
  ...withContinent('Asia', [
    'Afghanistan', 'Ajman', 'Armenia', 'Bahrain', 'Bangladesh', 'Bhutan',
    'British Indian Ocean Territory', 'Brunei', 'Burma', 'Cambodia', 'China', 'Christmas Island',
    'Cocos (KEELING) ISLANDS', 'Dubai', 'East Timor', 'Fujairah', 'Hong Kong', 'India', 'Indonesia',
    'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos',
    'Lebanon', 'Macau', 'Malaysia', 'Maldives', 'Mongolia', 'Nepal', 'North Korea',
    'Occupied Palestinian Territories', 'Oman', 'Pakistan', 'Philippines', 'Qatar', 'Ras Al-khaimah',
    'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan',
    'Thailand', 'Turkey', 'Turkmenistan', 'Umm Al-quwain', 'United Arab Emirates', 'Uzbekistan',
    'Vietnam', 'Yemen',
  ]),
  ...withContinent('Europe', [
    'Abu Dhabi', 'Akrotiri', 'Aland Islands', 'Albania', 'Andorra', 'Austria', 'Azerbaijan',
    'Belarus', 'Belgium', 'Bosnia And Herzegovina', 'Bulgaria', 'Cape Verde', 'Ceuta', 'Croatia',
    'Cyprus', 'Czech Republic', 'Denmark', 'Dhekelia', 'Estonia', 'Faroe Islands', 'Finland',
    'France', 'Georgia', 'Germany', 'Gibraltar', 'Greece', 'Guernsey', 'Hungary', 'Iceland',
    'Ireland', 'Isle Of Man', 'Italy', 'Jersey', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania',
    'Luxembourg', 'Macedonia', 'Malta', 'Melilla', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
    'Northern Ireland', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino',
    'Scotland', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Svalbard And Jan Mayen', 'Sweden',
    'Switzerland', 'Ukraine', 'Vatican City',
  ]),
  ...withContinent('North America', [
    'Anguilla', 'Antigua And Barbuda', 'Aruba', 'Barbados', 'Belize', 'Bermuda', 'Bonaire',
    'British Virgin Islands', 'Canada', 'Cayman Islands', 'Costa Rica', 'Cuba', 'Dominica',
    'Dominican Republic', 'El Salvador', 'Greenland', 'Grenada', 'Guadeloupe', 'Guatemala', 'Haiti',
    'Honduras', 'Jamaica', 'Martinique', 'Mexico', 'Montserrat', 'Navassa Island', 'Nicaragua',
    'Panama', 'Puerto Rico', 'Saba', 'Saint Barthélemy', 'Saint Pierre And Miquelon',
    'Saint Vincent', 'Saint-Martin', 'Sint Eustatius', 'Sint Maarten', 'St Kitts And Nevis',
    'St Lucia', 'The Bahamas', 'Trinidad And Tobago', 'Turks And Caicos Islands', 'United States',
    'United States Virgin Islands',
  ]),
  ...withContinent('Oceania', [
    'American Samoa', 'Australia', 'Baker Island', 'Cook Islands', 'Easter Island', 'Fiji',
    'French Polynesia', 'Guam', 'Howland Island', 'Jarvis Island', 'Johnston Atoll', 'Kingman Reef',
    'Kiribati', 'Marshall Islands', 'Micronesia', 'Midway Islands', 'Nauru', 'New Caledonia',
    'New Zealand', 'Niue', 'Norfolk Island', 'Northern Mariana Islands', 'Palau', 'Palmyra Atoll',
    'Papua New Guinea', 'Pitcairn, Henderson, Ducie And Oeno Islands', 'Samoa', 'Solomon Islands',
    'Tokelau', 'Tonga', 'Tuvalu', 'Vanuatu', 'Wake Island', 'Wallis And Futuna',
  ]),
  ...withContinent('South America', [
    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Falkland Islands',
    'French Guiana', 'Guyana', 'Paraguay', 'Peru', 'South Georgia And South Sandwich Islands',
    'Suriname', 'Uruguay', 'Venezuela',
  ]),
];

const LOCAL_AUTHORITY_NAMES = new Set(LOCAL_AUTHORITIES.map((l) => l.local_authority.toLowerCase()));
const REGION_NAMES = new Set(REGIONS.map((r) => r.toLowerCase()));
const COUNTRY_NAMES = new Map(COUNTRIES.map((c) => [c.country.toLowerCase(), c]));

/**
 * Classifies a raw area-of-operation string against the published reference
 * data. Returns `null` if it matches none of the three lists — callers must
 * treat that as "unrecognised value, needs manual review", never guess.
 */
export function classifyAreaOfOperation(
  name: string
): { geographic_area_type: GeographicAreaType; local_authority?: LocalAuthority; country?: CountryEntry } | null {
  const key = name.trim().toLowerCase();
  if (LOCAL_AUTHORITY_NAMES.has(key)) {
    const local_authority = LOCAL_AUTHORITIES.find((l) => l.local_authority.toLowerCase() === key);
    return { geographic_area_type: 'Local Authority', local_authority };
  }
  if (REGION_NAMES.has(key)) {
    return { geographic_area_type: 'Region' };
  }
  const country = COUNTRY_NAMES.get(key);
  if (country) {
    return { geographic_area_type: 'Country', country };
  }
  return null;
}
