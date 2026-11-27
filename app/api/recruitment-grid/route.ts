import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Grid feed for Recruitments.
 *
 * Recruitments are recruiter-owned WorkPosts (recruiterProfileId set,
 * professionalId null) - the SAME model Explore uses for professional posts.
 * This mirrors /api/explore-grid exactly, but selects recruiter posts, and
 * returns them as GridItems so the shared PostTileGrid renders them.
 *
 * A tile shows the media image (or gradient fallback), the recruiter's name
 * and the role title. Clicking opens /recruitments/reels?post=<id>.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const take = Math.max(1, Math.min(Number(searchParams.get('take') ?? 48) || 48, 60))
  const q = (searchParams.get('q') ?? '').trim()

  const posts = await prisma.workPost.findMany({
    where: {
      status: 'PUBLISHED',
      recruiterProfileId: { not: null },
      professionalId: null,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' as const } },
              { caption: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      title: true,
      caption: true,
      createdAt: true,
      recruiterProfile: {
        select: {
          id: true,
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

  const items = posts.map((post) => {
    const asset = post.mediaAssets[0]
    const user = post.recruiterProfile?.user
    return {
      id: post.id,
      postId: post.id,
      userId: user?.id ?? '',
      name: user?.name ?? 'Recruiter',
      username: user?.username ?? null,
      // The role title IS the headline for a recruitment tile.
      title: post.title ?? null,
      profilePhoto: null,
      image: asset
        ? /^https?:\/\//i.test(asset.providerAssetId)
          ? asset.providerAssetId
          : `/uploads/${asset.providerAssetId}`
        : null,
    }
  })

  return NextResponse.json({ items, nextCursor: null })
}
