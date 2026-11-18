import { prisma } from '@/lib/db'
import type { UserRole } from '@prisma/client'

/**
 * Boost assignment.
 *
 * There is NO single global boosted slot. Each VIEWER gets their own boosted
 * post at the top, and different viewers are shown different boosters at the
 * same moment. That is what lets several boosts run simultaneously without
 * competing for the same hour: a 7-day boost is 168 hours of ELIGIBILITY, and
 * every eligible boost is shown to some share of viewers throughout its window.
 *
 * Assignment is therefore computed per (viewer, hour) rather than pre-computed
 * into a schedule table. A per-viewer schedule would need a row per viewer per
 * hour; a per-hour global schedule cannot express "different viewers see
 * different posts", which is the whole point.
 *
 * The choice is DETERMINISTIC: the same viewer sees the same boosted post for
 * the whole hour, so refreshing does not flip it. It changes when the hour or
 * the set of active boosts changes.
 */

export const HOUR_MS = 60 * 60 * 1000

export function hourBucket(d: Date): number {
  return Math.floor(d.getTime() / HOUR_MS)
}

/** Stable non-cryptographic hash - small, fast, good enough for bucketing. */
export function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Picks which eligible boost fills a viewer's slot for a given hour.
 *
 * WEIGHTED, not uniform. Each boost occupies a slice of a total-width
 * number line proportional to its weight, and the hash chooses a point on
 * that line. A boost with weight 5 is therefore five times as likely to win a
 * given viewer-hour as a boost with weight 1 - which is what makes spending
 * more boosts in the same window buy more visibility.
 *
 * Still DETERMINISTIC for a given (viewer, hour, set of boosts): the same
 * hash point always lands in the same slice. `boosts` must be ordered
 * consistently by the caller (id ascending) or the slices shift.
 */
export function pickWeighted(
  viewerSeed: string,
  hour: number,
  boosts: { weight: number }[]
): number {
  if (boosts.length === 0) return -1

  // Integer-only running total, so there is no floating point drift between
  // two calls with identical inputs.
  let total = 0
  for (const b of boosts) total += Math.max(0, b.weight)
  if (total <= 0) return -1

  const point = hash(`${viewerSeed}:${hour}`) % total

  let running = 0
  for (let i = 0; i < boosts.length; i++) {
    running += Math.max(0, boosts[i].weight)
    if (point < running) return i
  }

  // Unreachable unless weights changed mid-computation.
  return boosts.length - 1
}

/**
 * Records that a boosted item was shown. Fire-and-forget: a failed impression
 * insert must never break the feed.
 */
export async function recordImpression({
  boostId,
  workPostId,
  viewerId,
  viewerRole,
  surface,
}: {
  boostId: string
  workPostId: string | null
  viewerId: string
  viewerRole: UserRole | null
  surface: 'FEED' | 'EXPLORE'
}) {
  try {
    await prisma.boostImpression.create({
      data: { boostId, workPostId, viewerId, viewerRole, surface },
    })
  } catch (err) {
    console.error('[recordImpression] failed:', err)
  }
}

export type ActiveBoost = {
  id: string
  userId: string
  weight: number
  workPostIds: string[]
}

/**
 * Boosts whose window covers `now`, with their selected posts, filtered to the
 * countries they target.
 *
 * `viewerCountry` is an ISO 3166-1 alpha-2 code from the request (Vercel sets
 * `x-vercel-ip-country`). PERMISSIVE BY DEFAULT: an empty target list means
 * "everywhere", and a null/unknown viewer country matches EVERY boost. Showing
 * nobody anything because geo lookup failed is worse than showing everyone
 * everything - VPNs and local dev both land in the unknown case.
 */
export async function getActiveBoosts(
  now = new Date(),
  viewerCountry: string | null = null
): Promise<ActiveBoost[]> {
  const boosts = await prisma.boost.findMany({
    where: {
      status: 'ACTIVE',
      startsAt: { lte: now },
      expiresAt: { gt: now },
    },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      userId: true,
      weight: true,
      targetCountries: true,
      posts: { select: { workPostId: true } },
    },
  })

  return boosts
    .filter(
      (b) =>
        b.targetCountries.length === 0 ||
        viewerCountry === null ||
        b.targetCountries.includes(viewerCountry)
    )
    .map((b) => ({
      id: b.id,
      userId: b.userId,
      weight: b.weight,
      workPostIds: b.posts.map((p) => p.workPostId),
    }))
}

/**
 * The work post to pin to the top of `viewerId`'s feed right now, if any.
 *
 * RECRUITERS ONLY. A boost buys access to the hiring audience, not more
 * eyeballs - professionals already see each other's work by posting. Returning
 * null here does NOT hide the post, it only stops it being lifted: the post
 * still appears normally in Recent and (if it matches) in For You.
 */
export async function boostedPostForViewer(
  viewerId: string,
  viewerRole: string | null,
  now = new Date(),
  viewerCountry: string | null = null
): Promise<{ boostId: string; workPostId: string } | null> {
  if (viewerRole !== 'RECRUITER') return null

  const active = await getActiveBoosts(now, viewerCountry)
  if (active.length === 0) return null

  const hour = hourBucket(now)
  const boost = active[pickWeighted(viewerId, hour, active)]
  if (!boost || boost.workPostIds.length === 0) return null

  // One post per turn, cycling by hour so a user's several posts all surface.
  return {
    boostId: boost.id,
    workPostId: boost.workPostIds[hour % boost.workPostIds.length],
  }
}

/**
 * The user whose profile should be pinned at the top of Explore for this
 * viewer. RECRUITERS ONLY, for the same reason as the feed pin - a professional
 * browsing Explore should see the normal directory, not paid placements.
 */
export async function boostedProfileForViewer(
  viewerId: string,
  viewerRole: string | null,
  now = new Date(),
  viewerCountry: string | null = null
): Promise<{ boostId: string; userId: string } | null> {
  if (viewerRole !== 'RECRUITER') return null

  const active = await getActiveBoosts(now, viewerCountry)
  if (active.length === 0) return null

  // Offset the seed so the Explore pick is not always the same boost as the
  // feed pick for the same viewer - the two surfaces are independent.
  const hour = hourBucket(now)
  const boost = active[pickWeighted(`${viewerId}:explore`, hour, active)]
  if (!boost) return null
  return { boostId: boost.id, userId: boost.userId }
}
