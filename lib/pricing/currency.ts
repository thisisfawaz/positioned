/**
 * Country -> currency for pricing display.
 *
 * Country comes from Vercel's `request.geo.country` (free, no third-party
 * service, no API key). It is NOT reliable for VPNs, bots, or localhost - all
 * of which fall back to USD.
 *
 * Prices are DEFINED per currency, not converted at runtime. An exchange rate
 * would drift and someone would have to maintain it; fixed prices are stable
 * and predictable for the buyer.
 */

export type CurrencyCode = 'USD' | 'NGN' | 'GBP' | 'EUR' | 'GHS' | 'KES' | 'ZAR' | 'CAD'

export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  NG: 'NGN',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  GB: 'GBP',
  IE: 'EUR',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  CA: 'CAD',
  US: 'USD',
}

export function currencyForCountry(country: string | null | undefined): CurrencyCode {
  if (!country) return 'USD'
  return COUNTRY_TO_CURRENCY[country.toUpperCase()] ?? 'USD'
}

/** Symbol + formatting locale per currency. */
export const CURRENCY_META: Record<
  CurrencyCode,
  { symbol: string; locale: string }
> = {
  USD: { symbol: '$', locale: 'en-US' },
  NGN: { symbol: '₦', locale: 'en-NG' },
  GBP: { symbol: '£', locale: 'en-GB' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GHS: { symbol: 'GH₵', locale: 'en-GH' },
  KES: { symbol: 'KSh', locale: 'en-KE' },
  ZAR: { symbol: 'R', locale: 'en-ZA' },
  CAD: { symbol: 'CA$', locale: 'en-CA' },
}

/**
 * Price in the given currency.
 *
 * Custom is $1 per day (BASE_DAY_PRICE in USD). The three tiers are separately
 * discounted bundles - they are NOT a rate curve, and Custom does not
 * interpolate between them.
 */
export const BASE_DAY_PRICE = 1

export const TIERS = [
  { days: 7, usd: 7 },
  { days: 14, usd: 12 },
  { days: 30, usd: 20 },
] as const

/**
 * Per-currency tier prices. Defined per currency, never converted at runtime.
 *
 * NGN is a DELIBERATE rate set by the user: $1 = NGN 1,000. That keeps the
 * Nigerian price round and stable instead of drifting with the exchange rate.
 *
 * The other currencies are USD converted at approximate rates and rounded to
 * whole units. They are INDICATIVE, not deliberate local pricing - a market
 * price reflects what that market can pay, which is a business decision.
 * Replace them when those markets are priced properly.
 *
 * Approximate rates: 1 USD = 0.79 GBP, 0.92 EUR, 15.2 GHS, 129 KES,
 * 18.1 ZAR, 1.38 CAD.
 */
export const TIER_PRICES: Record<CurrencyCode, number[]> = {
  USD: [7, 12, 20],
  // Deliberate: $1 = NGN 1,000.
  NGN: [7000, 12000, 20000],
  GBP: [6, 9, 16],
  EUR: [6, 11, 18],
  GHS: [106, 182, 304],
  KES: [903, 1548, 2580],
  ZAR: [127, 217, 362],
  CAD: [10, 17, 28],
}

/**
 * Custom price = days x the local daily rate, rounded to a whole unit.
 * The daily rate comes from the 7-day tier so Custom and the tiers stay
 * consistent within a currency (USD 7/7 = 1/day, NGN 7000/7 = 1000/day).
 *
 * Custom is deliberately the most expensive per-day option - the 14 and 30 day
 * bundles are discounted - which is what makes the bundles worth buying.
 */
export function customPrice(days: number, currency: CurrencyCode): number {
  const base = TIER_PRICES[currency][0] / TIERS[0].days
  return Math.round(base * days)
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const { symbol, locale } = CURRENCY_META[currency]
  const n = amount.toLocaleString(locale, { maximumFractionDigits: 2 })
  return `${symbol}${n}`
}
