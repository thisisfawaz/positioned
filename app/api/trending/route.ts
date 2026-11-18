import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Posts published inside this window are "recent" and always rank above older
// ones, regardless of like count. A 3-like post from an hour ago outranks a
// 200-like post from last week - otherwise the list becomes a hall of fame
// instead of a trend.
const RECENT_WINDOW_HOURS = 5

const postSelect = {
  id: true,
  title: true,
  purpose: true,
  challenge: true,
  goal: true,
  approach: true,
  solution: true,
  contribution: true,
  result: true,
  metrics: true,
  situation: true,
  action: true,
  skills: true,
  likes: true,
  views: true,
  createdAt: true,
  // Needed by the right-rail "Trending work" grid. Without it the tiles have
  // no image and silently fall back to a title-on-gradient block.
  mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1, select: { providerAssetId: true } },
  professional: {
    select: {
      user: { select: { id: true, username: true } },
    },
  },
} as const

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const take = Math.min(Number(searchParams.get('take') ?? 5) || 5, 50)

  const cutoff = new Date(Date.now() - RECENT_WINDOW_HOURS * 60 * 60 * 1000)

  // 1. Everything inside the window, best first.
  const recent = await prisma.workPost.findMany({
    where: { status: 'PUBLISHED', createdAt: { gte: cutoff } },
    orderBy: [{ likes: 'desc' }, { views: 'desc' }, { createdAt: 'desc' }],
    take,
    select: postSelect,
  })

  if (recent.length >= take) {
    return NextResponse.json({ posts: recent, recentCount: recent.length })
  }

  // 2. Not enough recent posts - backfill with the best older ones. Old content
  //    stays on the board until something displaces it; a quiet 5 hours must
  //    not empty the page.
  const backfill = await prisma.workPost.findMany({
    where: { status: 'PUBLISHED', createdAt: { lt: cutoff } },
    orderBy: [{ likes: 'desc' }, { views: 'desc' }, { createdAt: 'desc' }],
    take: take - recent.length,
    select: postSelect,
  })

  return NextResponse.json({
    posts: [...recent, ...backfill],
    recentCount: recent.length,
  })
}
