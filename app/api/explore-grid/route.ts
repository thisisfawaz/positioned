import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Grid feed for Explore.
 *
 * Returns ACTUAL POSTS, not profiles. The earlier version returned one row per
 * professional profile and rendered `image: null` tiles for anyone without a
 * published post - which is why the grid looked like a wall of random
 * usernames. This queries WorkPost directly so every tile is real content.
 *
 * RECRUITMENTS ARE EXCLUDED. A post belongs to a professional when
 * `professionalId` is set and `recruiterProfileId` is not. Recruiter-owned
 * posts never appear in Explore; they only surface inside the feed reels.
 *
 * Only posts with at least one media asset are included - Explore is a visual
 * grid, so a post without media has nothing to show and is skipped rather than
 * rendered as an empty tile.
 *
 * PAGINATION: cursor-based on `createdAt desc, id desc`. Pass `?cursor=<postId>`
 * (the id of the LAST item on the previous page) to get the next page. The
 * response carries `nextCursor` (null once every post has been returned), so the
 * client can keep scrolling until the end. `?take` is the page size (max 60);
 * `?take=48` on the first request is Explore's initial batch.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const take = Math.max(1, Math.min(Number(searchParams.get('take') ?? 48) || 48, 60))
  const cursor = searchParams.get('cursor')

  // Fetch one extra row so we can tell whether another page exists without a
  // separate count query.
  const fetchCount = take + 1

  try {
    // Resolve the cursor post's sort key. Both sort keys matter because
    // `createdAt` is not unique - two posts in the same millisecond must not
    // cause a skipped or duplicated tile across a page boundary.
    let cursorWhere = {}
    if (cursor) {
      const anchor = await prisma.workPost.findUnique({
        where: { id: cursor },
        select: { createdAt: true, id: true },
      })
      if (anchor) {
        cursorWhere = {
          OR: [
            { createdAt: { lt: anchor.createdAt } },
            { createdAt: anchor.createdAt, id: { lt: anchor.id } },
          ],
        }
      }
    }

    const posts = await prisma.workPost.findMany({
      where: {
        status: 'PUBLISHED',
        professionalId: { not: null },
        recruiterProfileId: null,
        mediaAssets: { some: {} },
        professional: {
          user: {
            OR: [{ settings: { is: null } }, { settings: { is: { profileVisible: true } } }],
          },
        },
        ...cursorWhere,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: fetchCount,
      select: {
        id: true,
        caption: true,
        title: true,
        createdAt: true,
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

    const hasMore = posts.length > take
    const pagePosts = hasMore ? posts.slice(0, take) : posts

    const items = pagePosts.map((post) => {
      const asset = post.mediaAssets[0]
      const prof = post.professional
      const user = prof?.user
      return {
        // One tile PER POST now, so the tile id is the post id.
        id: post.id,
        postId: post.id,
        userId: user?.id ?? '',
        name: user?.name ?? 'Unknown',
        username: user?.username ?? null,
        title: prof?.title ?? null,
        profilePhoto: prof?.profilePhoto ?? null,
        // providerAssetId may be a bare LOCAL filename OR a full external URL.
        // Prefixing blindly produced `/uploads/https://...`, which never loads.
        image: asset
          ? /^https?:\/\//i.test(asset.providerAssetId)
            ? asset.providerAssetId
            : `/uploads/${asset.providerAssetId}`
          : null,
      }
    })

    const nextCursor = hasMore ? pagePosts[pagePosts.length - 1]?.id ?? null : null

    return NextResponse.json({ items, nextCursor })
  } catch (err) {
    console.error('[explore-grid] failed:', err)
    return NextResponse.json({ items: [], nextCursor: null })
  }
}
