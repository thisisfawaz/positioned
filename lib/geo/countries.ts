/**
 * Country list for boost targeting.
 *
 * ISO 3166-1 alpha-2 codes, because that is what `x-vercel-ip-country` returns
 * and what `Boost.targetCountries` stores. Display names are for the UI only.
 *
 * IMPORTANT: this is deliberately a CURATED list, not every country in the
 * world. Add entries as they are needed. Never key anything off the display
 * name - only the code is stable.
 */

export type Country = { code: string; name: string }

export const COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'IE', name: 'Ireland' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'EG', name: 'Egypt' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'PL', name: 'Poland' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'PH', name: 'Philippines' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
]

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]))

/** Display name for a code, falling back to the raw code so unknown values
 *  still render instead of showing a blank. */
export function countryName(code: string): string {
  return BY_CODE.get(code)?.name ?? code
}

/** True when `code` is a country this app knows how to target. */
export function isKnownCountry(code: string): boolean {
  return BY_CODE.has(code)
}
