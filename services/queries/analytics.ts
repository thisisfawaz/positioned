import { prisma } from '@/lib/db'

/**
 * Visibility analytics for one professional.
 *
 * `views`, `likes` and `saves` are denormalised counters on WorkPost and are
 * maintained by the view/like routes, so they are read directly.
 *
 * `recruiterViews` is NOT read from WorkPost.recruiterViews - that column is
 * never written anywhere in the codebase and is permanently 0. Recruiter views
 * are derived from WorkView rows joined to User.role instead.
 */
export async function getVisibilityAnalytics(userId: string) {
  const professional = await prisma.professionalProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!professional) {
    return null
  }

  const posts = await prisma.workPost.findMany({
    where: { professionalId: professional.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      views: true,
      likes: true,
      saves: true,
      createdAt: true,
      // One image per row, for the thumbnails in Work performance and the
      // boost picker. Without it every row renders text-only.
      mediaAssets: {
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { providerAssetId: true },
      },
      workViews: {
        select: { viewer: { select: { role: true } } },
      },
    },
  })

  // Which posts are currently inside an active boost. Read from BoostPost,
  // not WorkPost.boosted - that column is legacy and nothing writes it.
  const now = new Date()
  const activeBoostPosts = await prisma.boostPost.findMany({
    where: {
      boost: { status: 'ACTIVE', startsAt: { lte: now }, expiresAt: { gt: now } },
      workPost: { professionalId: professional.id },
    },
    select: { workPostId: true },
  })
  const boostedIds = new Set(activeBoostPosts.map((b) => b.workPostId))

  const perPost = posts.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    views: p.views,
    likes: p.likes,
    saves: p.saves,
    // Derived, not the dead counter.
    recruiterViews: p.workViews.filter((v) => v.viewer?.role === 'RECRUITER').length,
    boosted: boostedIds.has(p.id),
    createdAt: p.createdAt,
    // providerAssetId is EITHER a bare local filename OR a full external URL.
    image: p.mediaAssets[0]
      ? /^https?:\/\//i.test(p.mediaAssets[0].providerAssetId)
        ? p.mediaAssets[0].providerAssetId
        : `/uploads/${p.mediaAssets[0].providerAssetId}`
      : null,
  }))

  // Boost impressions now only ever count recruiters, since the boost is shown
  // to recruiters only. This is the number the buyer actually cares about.
  const boostImpressions = await prisma.boostImpression.count({
    where: {
      boost: { userId },
      viewerRole: 'RECRUITER',
    },
  })

  // The user's current boost, if any - so the page can show what is running
  // and how many recruiters it has actually reached.
  const activeBoost = await prisma.boost.findFirst({
    where: { userId, status: 'ACTIVE', startsAt: { lte: now }, expiresAt: { gt: now } },
    select: {
      id: true,
      days: true,
      expiresAt: true,
      posts: { select: { workPost: { select: { id: true, title: true } } } },
      _count: { select: { impressions: true } },
    },
  })

  return {
    activeBoost: activeBoost
      ? {
          id: activeBoost.id,
          days: activeBoost.days,
          expiresAt: activeBoost.expiresAt.toISOString(),
          posts: activeBoost.posts.map((p) => p.workPost),
          impressions: activeBoost._count.impressions,
        }
      : null,
    totals: {
      views: perPost.reduce((n, p) => n + p.views, 0),
      likes: perPost.reduce((n, p) => n + p.likes, 0),
      saves: perPost.reduce((n, p) => n + p.saves, 0),
      recruiterViews: perPost.reduce((n, p) => n + p.recruiterViews, 0),
      seenByRecruiters: boostImpressions,
      posts: perPost.length,
    },
    perPost,
  }
}
