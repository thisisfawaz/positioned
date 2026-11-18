import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ReelFeed } from '@/components/work/ReelFeed'

export const dynamic = 'force-dynamic'

/**
 * EXPLORE'S OWN REEL.
 *
 * Reached by clicking a tile on Explore. It is the SAME reel UI as the feed and
 * a profile's reel (one component), scoped to the same set of posts Explore's
 * grid shows: published professional work that has media. It does NOT drop the
 * viewer into the global home feed.
 *
 * `?post=` opens on the clicked post.
 */
export default async function ExploreReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>
}) {
  const { post } = await searchParams

  const posts = await prisma.workPost.findMany({
    where: {
      status: 'PUBLISHED',
      professionalId: { not: null },
      recruiterProfileId: null,
      mediaAssets: { some: {} },
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
    include: {
      mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 },
      professional: {
        select: {
          title: true,
          location: true,
          profilePhoto: true,
          user: { select: { id: true, name: true, username: true } },
        },
      },
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
      emptyMessage="Nothing to show yet."
    />
  )
}
