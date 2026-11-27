import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ReelFeed } from '@/components/work/ReelFeed'

export const dynamic = 'force-dynamic'

/**
 * RECRUITMENTS' OWN REEL.
 *
 * Reached by clicking a tile on the Recruitments grid. Same reel UI as Explore
 * and the feed (one component), scoped to recruiter-owned WorkPosts - the
 * mirror of Explore's reel, which scopes to professional posts. `?post=` opens
 * on the clicked role.
 */
export default async function RecruitmentReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>
}) {
  const { post } = await searchParams
  const currentUser = await getCurrentUser()

  const posts = await prisma.workPost.findMany({
    where: {
      status: 'PUBLISHED',
      recruiterProfileId: { not: null },
      professionalId: null,
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
    include: {
      mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 },
      recruiterProfile: { include: { user: true } },
      professional: { include: { user: true } },
    },
  })

  if (posts.length === 0) notFound()

  const entries = posts.map((p) => ({
    kind: 'work' as const,
    id: p.id,
    createdAt: p.createdAt as unknown as string,
    item: p,
  }))

  return (
    <ReelFeed
      posts={entries as any}
      focusPostId={post ?? null}
      viewerId={currentUser?.id}
      viewerRole={currentUser?.role as any}
      emptyMessage="No open roles yet."
    />
  )
}
