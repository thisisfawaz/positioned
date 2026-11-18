import { prisma } from '@/lib/db'

/**
 * Records a view for a work post, once per viewer.
 * Returns the current view count.
 */
export async function recordWorkView(
  workPostId: string,
  viewerId: string | null
): Promise<number> {
  try {
    // Unknown viewer: never count. Without an identity we cannot dedupe,
    // and counting every anonymous hit inflates the number without limit.
    if (!viewerId) {
      const current = await prisma.workPost.findUnique({
        where: { id: workPostId },
        select: { views: true },
      })
      return current?.views ?? 0
    }

    const existing = await prisma.workView.findFirst({
      where: { workPostId, viewerId },
      select: { id: true },
    })

    if (existing) {
      const current = await prisma.workPost.findUnique({
        where: { id: workPostId },
        select: { views: true },
      })
      return current?.views ?? 0
    }

    return await prisma.$transaction(async (tx) => {
      await tx.workView.create({
        data: { workPostId, viewerId },
      })
      const updated = await tx.workPost.update({
        where: { id: workPostId },
        data: { views: { increment: 1 } },
        select: { views: true },
      })
      return updated.views
    })
  } catch (err) {
    console.error('[recordWorkView] failed:', err)
    return 0
  }
}
