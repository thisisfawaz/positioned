/**
 * Boost pricing.
 *
 * A boost has TWO choices, and they are NOT multiplied together:
 *   - HOW MANY BOOSTS you put in (the budget: 1 boost = $1)
 *   - HOW MANY DAYS the run lasts (the window the budget is spread across)
 *
 * Cost is the budget. A 7-day run and a 30-day run at the same budget cost the
 * same credits. The days only change PACING: the same budget spread over more
 * days means a smaller per-day share of the boosted slot, so fewer recruiters
 * see it per day - but the total spend is identical.
 *
 * FLOOR: at least 1 boost per day. A 30-day run therefore needs a budget of at
 * least 30 boosts. This stops a large budget being stretched so thin over a
 * long window that the boost does nothing meaningful on any given day.
 *
 * Kept separate from lib/pricing/currency.ts: that file formats money, this one
 * defines what a boost COSTS and BUYS.
 */

/** 1 credit = 1 unit of weight. */
export const WEIGHT_PER_CREDIT = 1

/** Minimum spend, in boosts, for a single day of a run. */
export const MIN_BOOSTS_PER_DAY = 1

/** Preset durations. Custom is not offered - a free-form day count is what
 *  made the old form feel like a calculator. */
export const BOOST_DAY_OPTIONS = [7, 14, 30] as const

/** Weight for a credit budget. Floored at 1 so a boost always does something. */
export function weightForCredits(credits: number): number {
  return Math.max(1, Math.round(credits) * WEIGHT_PER_CREDIT)
}

/**
 * Total credits for a run: the budget itself. Days are NOT a multiplier.
 *
 * The days argument is accepted so callers keep one call site, but it is only
 * used to enforce the per-day floor - it never scales the price.
 *
 * Both inputs must be sane whole numbers; anything else yields 0 so the caller
 * can treat it as "not yet valid" rather than silently charging something odd.
 */
export function boostCost(credits: number, days: number): number {
  if (!Number.isInteger(credits) || credits < 1) return 0
  if (!Number.isInteger(days) || days < 1) return 0
  if (credits < days * MIN_BOOSTS_PER_DAY) return 0
  return credits
}

/**
 * Whether a budget is enough for a given window. Separate from boostCost so the
 * form can tell "invalid number" apart from "not enough for these many days".
 */
export function meetsDailyFloor(credits: number, days: number): boolean {
  if (!Number.isInteger(credits) || !Number.isInteger(days)) return false
  if (credits < 1 || days < 1) return false
  return credits >= days * MIN_BOOSTS_PER_DAY
}

/** Minimum budget for a window: 1 boost per day. */
export function minBoostsForDays(days: number): number {
  return Math.max(1, Math.round(days) * MIN_BOOSTS_PER_DAY)
}
