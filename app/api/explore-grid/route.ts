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
  const q = (searchParams.get('q') ?? '').trim()
  const sortParam = searchParams.get('sort') ?? 'new'
  const sort = sortParam === 'liked' || sortParam === 'viewed' ? sortParam : 'new'
  const mediaParam = searchParams.get('media') ?? 'all'
  const media = mediaParam === 'image' || mediaParam === 'video' ? mediaParam : 'all'

  // ORDER BY per sort mode. A UNIQUE tiebreaker (id) is mandatory for cursor
  // pagination - without it two rows sharing a value could be skipped or
  // repeated across a page boundary.
  const orderBy =
    sort === 'liked'
      ? [{ likes: 'desc' as const }, { id: 'desc' as const }]
      : sort === 'viewed'
        ? [{ views: 'desc' as const }, { id: 'desc' as const }]
        : [{ createdAt: 'desc' as const }, { id: 'desc' as const }]

  // Free-text search across the fields a user actually sees on a tile: the
  // author's name/username, their professional title, and the post title /
  // caption. Case-insensitive. Applied SERVER-SIDE so it searches every post,
  // not just the batch already loaded in the grid.
  const searchWhere = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { caption: { contains: q, mode: 'insensitive' as const } },
          { professional: { title: { contains: q, mode: 'insensitive' as const } } },
          { professional: { user: { name: { contains: q, mode: 'insensitive' as const } } } },
          { professional: { user: { username: { contains: q, mode: 'insensitive' as const } } } },
        ],
      }
    : {}

  // Media-type filter. "image" = has at least one MediaAsset; "video" = a
  // YouTube embed (mediaType VIDEO / videoUrl set). Explore's grid only renders
  // images today, so "video" filters to those posts but they render as tiles
  // via the existing image field when a poster exists.
  const mediaWhere =
    media === 'image'
      ? { mediaAssets: { some: {} } }
      : media === 'video'
        ? { OR: [{ mediaType: 'VIDEO' as const }, { videoUrl: { not: null } }] }
        : { mediaAssets: { some: {} } }

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
        select: { createdAt: true, likes: true, views: true, id: true },
      })
      if (anchor) {
        // The cursor comparison MUST mirror the active orderBy, otherwise
        // sorting by likes but paging by createdAt skips rows.
        if (sort === 'liked') {
          cursorWhere = {
            OR: [
              { likes: { lt: anchor.likes } },
              { likes: anchor.likes, id: { lt: anchor.id } },
            ],
          }
        } else if (sort === 'viewed') {
          cursorWhere = {
            OR: [
              { views: { lt: anchor.views } },
              { views: anchor.views, id: { lt: anchor.id } },
            ],
          }
        } else {
          cursorWhere = {
            OR: [
              { createdAt: { lt: anchor.createdAt } },
              { createdAt: anchor.createdAt, id: { lt: anchor.id } },
            ],
          }
        }
      }
    }

    const posts = await prisma.workPost.findMany({
      where: {
        status: 'PUBLISHED',
        professionalId: { not: null },
        recruiterProfileId: null,
        ...mediaWhere,
        professional: {
          user: {
            OR: [{ settings: { is: null } }, { settings: { is: { profileVisible: true } } }],
          },
        },
        ...searchWhere,
        ...cursorWhere,
      },
      orderBy,
      take: fetchCount,
      select: {
        id: true,
        caption: true,
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
