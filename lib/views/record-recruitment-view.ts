import { prisma } from '@/lib/db'

/**
 * Records a view for a recruitment, once per viewer.
 * Anonymous viewers are not counted - there is no identity to dedupe against.
 */
export async function recordRecruitmentView(
  recruitmentId: string,
  viewerId: string | null
): Promise<number> {
  try {
    const current = await prisma.recruitment.findUnique({
      where: { id: recruitmentId },
      select: { views: true },
    })

    if (!viewerId) return current?.views ?? 0

    const existing = await prisma.recruitmentView.findUnique({
      where: {
        recruitmentId_viewerId: { recruitmentId, viewerId },
      },
      select: { id: true },
    })

    if (existing) return current?.views ?? 0

    return await prisma.$transaction(async (tx) => {
      await tx.recruitmentView.create({
        data: { recruitmentId, viewerId },
      })
      const updated = await tx.recruitment.update({
        where: { id: recruitmentId },
        data: { views: { increment: 1 } },
        select: { views: true },
      })
      return updated.views
    })
  } catch (err) {
    console.error('[recordRecruitmentView] failed:', err)
    return 0
  }
}
