/**
 * Premium constants. CLIENT-SAFE - no prisma import here, because client
 * components (e.g. PremiumBoostForm) import these and pulling Prisma into the
 * browser bundle throws at render (that was the "something went wrong").
 *
 * The prisma-dependent helpers live in lib/premium-server.ts.
 */
export const PREMIUM_PRICE = 2
export const PREMIUM_CURRENCY = 'USD'
export const PREMIUM_PERIOD_DAYS = 30
export const PREMIUM_BOOST_SLOTS = 4

export function isPremiumActive(premiumUntil: Date | null | undefined): boolean {
  return Boolean(premiumUntil && premiumUntil.getTime() > Date.now())
}
