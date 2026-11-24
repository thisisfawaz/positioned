import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Grid feed for Explore.
 *
 * SELECTION: take posts from the viewer's LOCAL day first. If that day does
 * not fill DAILY_CAP, walk BACKWARDS day by day, adding each earlier day's
 * posts, until the cap is reached or the platform runs out. 5 today + 40
 * yesterday + 55 the day before fills 100; a platform with 19 posts in total
 * returns all 19.
 *
 * DISPLAY: the chosen set is then shuffled ONCE with the per-visit seed, so
 * days are INTERLEAVED rather than stacked.
 *
 * FILTERS apply before the cap: search (`q`) narrows the candidate set, then
 * the day walk fills from the MATCHING posts.
 *
 * PAGINATION: the seed travels in the cursor (`<seed>|<postId>`) so every page
 * of one visit continues the SAME ordering.
 *
 * The viewer's day is defined by `tz` (IANA name). Invalid/missing -> UTC.
 * Only published professional posts WITH media are considered - Explore is a
 * visual grid, so a post without media has nothing to show.
 */

/** Max tiles Explore will show per visit. */
const DAILY_CAP = 100

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const take = Math.max(1, Math.min(Number(searchParams.get('take') ?? 48) || 48, 60))
  const cursor = searchParams.get('cursor')
  const q = (searchParams.get('q') ?? '').trim()

  // No sort = the seeded shuffle (default). There is no chronological mode.
  const sortParam = searchParams.get('sort') ?? ''
  const sort =
    sortParam === 'liked' || sortParam === 'viewed' || sortParam === 'saved'
      ? sortParam
      : ''

  // The cursor carries `<seed>|<postId>` so paging continues the SAME shuffle.
  let seed = searchParams.get('seed') ?? ''
  let cursorPostId = cursor
  if (cursor && cursor.includes('|')) {
    const [cSeed, cId] = cursor.split('|')
    if (cSeed) seed = cSeed
    cursorPostId = cId
  }
  if (!seed) seed = Math.random().toString(36).slice(2, 10)

  // Validate the zone: an invalid name silently breaks AT TIME ZONE.
  let zone = searchParams.get('tz') || 'UTC'
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
  } catch {
    zone = 'UTC'
  }

  const searchClause = q
    ? Prisma.sql`AND ("title" ILIKE ${'%' + q + '%'} OR "caption" ILIKE ${'%' + q + '%'})`
    : Prisma.empty

  const displayOrder =
    sort === 'liked'
      ? Prisma.sql`"likes" DESC, "id" DESC`
      : sort === 'viewed'
        ? Prisma.sql`"views" DESC, "id" DESC`
        : sort === 'saved'
          ? Prisma.sql`"saves" DESC, "id" DESC`
          : Prisma.sql`md5("id" || ${seed}) ASC`

  const cursorClause = cursorPostId ? Prisma.sql`AND "id" <> ${cursorPostId}` : Prisma.empty

  try {
    const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      WITH chosen AS (
        SELECT "id"
        FROM "WorkPost"
        WHERE "status" = 'PUBLISHED'
          AND "professionalId" IS NOT NULL
          AND "recruiterProfileId" IS NULL
          AND EXISTS (
            SELECT 1 FROM "MediaAsset" m WHERE m."workPostId" = "WorkPost"."id"
          )
          ${searchClause}
        ORDER BY ("createdAt" AT TIME ZONE ${zone})::date DESC,
                 md5("id" || ${seed}) ASC
        LIMIT ${DAILY_CAP}
      )
      SELECT "id" FROM chosen
      WHERE 1=1 ${cursorClause}
      ORDER BY ${displayOrder}
      LIMIT ${take + 1}
    `)

    const pageIds = rows.slice(0, take).map((r) => r.id)
    const hasMore = rows.length > take

    if (pageIds.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null, seed })
    }

    // Hydrate, then re-order in JS: findMany does not preserve IN() order and
    // the shuffle order matters.
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
