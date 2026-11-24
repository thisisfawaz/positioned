import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Grid feed for Explore.
 *
 * WHAT IT SHOWS: a random sample of TODAY's posts, capped at DAILY_CAP, where
 * "today" is the VIEWER's local day (the client sends its IANA timezone as
 * `tz`, defaulting to UTC). With 2000 posts published today, Explore returns a
 * random 100 of them; open Explore again and a DIFFERENT random 100 is chosen.
 * Fewer than 100 posts today simply returns whatever exists (possibly none).
 *
 * FILTERS APPLY FIRST: search (`q`) and media type narrow the day's set, then
 * the random cap applies to the MATCHING posts. A narrow search therefore
 * returns every match (even if only 12), not a random 100 of a filtered pool.
 *
 * PAGINATION WITHIN THE SAMPLE: the random ORDER is stable for one visit only.
 * The seed that produced it travels with the cursor (`<seed>|<postId>`) so the
 * next page continues the SAME ordering. Without that each page would reshuffle
 * and tiles would repeat or vanish.
 *
 * RECRUITMENTS ARE EXCLUDED. A post belongs to a professional when
 * `professionalId` is set and `recruiterProfileId` is not.
 *
 * Only posts with at least one media asset are included - Explore is a visual
 * grid, so a post without media has nothing to show.
 */

/** Max tiles Explore will show from a single day. */
const DAILY_CAP = 100

/**
 * The [start, end) UTC instants of the viewer's LOCAL day.
 *
 * `timeZone` is an IANA name (e.g. "Europe/London"); an invalid one falls back
 * to UTC rather than throwing. The offset is read at LOCAL NOON, where a normal
 * zone cannot be mid-transition, which keeps the result DST-safe.
 */
function localDayWindow(timeZone: string): { start: Date; end: Date } {
  let tz = timeZone
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
  } catch {
    tz = 'UTC'
  }

  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const y = Number(get('year'))
  const m = Number(get('month'))
  const d = Number(get('day'))

  // Use NOON of the local day as the reference point so the offset lookup is
  // never inside a DST transition.
  const noonUtc = Date.UTC(y, m - 1, d, 12, 0, 0)

  // What the zone's wall clock reads at that UTC instant, expressed as if it
  // were UTC. The difference is the zone's offset at that moment.
  const zoneParts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(noonUtc))
  const zg = (t: string) => Number(zoneParts.find((p) => p.type === t)?.value ?? '0')
  const zoneAsUtc = Date.UTC(
    zg('year'),
    zg('month') - 1,
    zg('day'),
    zg('hour') % 24,
    zg('minute'),
    zg('second')
  )
  const offsetMs = zoneAsUtc - noonUtc

  const localMidnightUtc = Date.UTC(y, m - 1, d, 0, 0, 0) - offsetMs
  return {
    start: new Date(localMidnightUtc),
    end: new Date(localMidnightUtc + 24 * 60 * 60 * 1000),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const take = Math.max(1, Math.min(Number(searchParams.get('take') ?? 48) || 48, 60))
  const cursor = searchParams.get('cursor')
  const q = (searchParams.get('q') ?? '').trim()
  // No sort = the daily random shuffle (the default). 'saved' orders by the
  // saves counter; there is no 'new'/chronological mode - Explore is a sample
  // of the day, not a reverse-chronological list.
  const sortParam = searchParams.get('sort') ?? ''
  const sort =
    sortParam === 'liked' || sortParam === 'viewed' || sortParam === 'saved'
      ? sortParam
      : ''
  const mediaParam = searchParams.get('media') ?? 'all'
  const media = mediaParam === 'image' ? mediaParam : 'all'
  const tz = searchParams.get('tz') ?? 'UTC'

  // The cursor carries `<seed>|<postId>` so paging continues the SAME shuffle.
  // A bare cursor (no seed) is tolerated for older clients.
  let seed = searchParams.get('seed') ?? ''
  let cursorPostId = cursor
  if (cursor && cursor.includes('|')) {
    const [cSeed, cId] = cursor.split('|')
    if (cSeed) seed = cSeed
    cursorPostId = cId
  }
  if (!seed) seed = Math.random().toString(36).slice(2, 10)

  const { start, end } = localDayWindow(tz)

  try {
    // The whole selection runs in ONE raw query so the seeded shuffle, the
    // DAILY_CAP and the cursor all apply in the database.
    //
    // Layer 1 (`day`): the viewer's local day, minus recruitments, images only,
    //   with the search filter. Random order, capped at DAILY_CAP.
    // Layer 2 (`older`): the same filters for posts BEFORE today, randomly
    //   ordered under the same seed, excluding ids already in `day`.
    // Layer 3: page within the combined pool, today's posts first (`kind`).
    // Quoted identifiers are required: the columns are camelCase and Postgres
    // folds unquoted names to lower case.
    const searchClause = q
      ? Prisma.sql`AND ("title" ILIKE ${'%' + q + '%'} OR "caption" ILIKE ${'%' + q + '%'})`
      : Prisma.empty
    const mediaClause = media === 'image' ? Prisma.empty : Prisma.empty

    const orderClause =
      sort === 'liked'
        ? Prisma.sql`"likes" DESC, "id" DESC`
        : sort === 'viewed'
          ? Prisma.sql`"views" DESC, "id" DESC`
          : sort === 'saved'
            ? Prisma.sql`"saves" DESC, "id" DESC`
            : Prisma.sql`md5("id" || ${seed}) ASC`

    const cursorClause = cursorPostId
      ? Prisma.sql`AND "id" <> ${cursorPostId}`
      : Prisma.empty

    // The day tier is preferred. If the viewer's local day has FEWER than
    // DAILY_CAP matching posts (including zero), the remaining slots are
    // FILLED from other days, also randomly under the same seed. `kind` orders
    // day posts first so the mix is deterministic: today's sample leads, older
    // random posts pad the tail.
    const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      WITH day AS (
        SELECT "id"
        FROM "WorkPost"
        WHERE "status" = 'PUBLISHED'
          AND "professionalId" IS NOT NULL
          AND "recruiterProfileId" IS NULL
          AND "createdAt" >= ${start}
          AND "createdAt" < ${end}
          AND EXISTS (
            SELECT 1 FROM "MediaAsset" m WHERE m."workPostId" = "WorkPost"."id"
          )
          ${searchClause}
          ${mediaClause}
        ORDER BY md5("id" || ${seed}) ASC
        LIMIT ${DAILY_CAP}
      ),
      older AS (
        SELECT "id"
        FROM "WorkPost"
        WHERE "status" = 'PUBLISHED'
          AND "professionalId" IS NOT NULL
          AND "recruiterProfileId" IS NULL
          AND "createdAt" < ${start}
          AND EXISTS (
            SELECT 1 FROM "MediaAsset" m WHERE m."workPostId" = "WorkPost"."id"
          )
          ${searchClause}
          ${mediaClause}
          AND "id" NOT IN (SELECT "id" FROM day)
        ORDER BY md5("id" || ${seed}) ASC
        LIMIT ${DAILY_CAP}
      ),
      pool AS (
        SELECT "id", 0 AS kind FROM day
        UNION ALL
        SELECT "id", 1 AS kind FROM older
      )
      SELECT "id" FROM pool
      WHERE 1=1 ${cursorClause}
      ORDER BY kind ASC, ${orderClause}
      LIMIT ${take + 1}
    `)

    const pageIds = rows.slice(0, take).map((r) => r.id)
    const hasMore = rows.length > take

    if (pageIds.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null, seed })
    }

    // Hydrate the page, then re-order in JS to match pageIds: findMany does not
    // preserve the order of an IN() list, and the shuffle order matters here.
    const posts = await prisma.workPost.findMany({
      where: { id: { in: pageIds } },
      select: {
        id: true,
        title: true,
        createdAt: true,
        likes: true,
        views: true,
        professional: {
          select: {
            id: true,
            title: true,
            profilePhoto: true,
            userId: true,
            user: { select: { id: true, name: true, username: true } },
          },
        },
        mediaAssets: {
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { providerAssetId: true },
        },
      },
    })

    const byId = new Map(posts.map((p) => [p.id, p]))
    const items = pageIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((post) => {
        const asset = post.mediaAssets[0]
        const prof = post.professional
        const user = prof?.user
        return {
          id: post.id,
          postId: post.id,
          userId: user?.id ?? '',
          name: user?.name ?? 'Unknown',
          username: user?.username ?? null,
          title: prof?.title ?? null,
          profilePhoto: prof?.profilePhoto ?? null,
          image: asset
            ? /^https?:\/\//i.test(asset.providerAssetId)
              ? asset.providerAssetId
              : `/uploads/${asset.providerAssetId}`
            : null,
        }
      })

    const nextCursor =
      hasMore && pageIds.length > 0 ? `${seed}|${pageIds[pageIds.length - 1]}` : null

    return NextResponse.json({ items, nextCursor, seed })
  } catch (err) {
    console.error('[explore-grid] failed:', err)
    return NextResponse.json({ items: [], nextCursor: null, seed })
  }
}
