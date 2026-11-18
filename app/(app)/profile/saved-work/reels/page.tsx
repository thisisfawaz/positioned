import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ReelFeed } from '@/components/work/ReelFeed'

export const dynamic = 'force-dynamic'

/**
 * SAVES' OWN REEL.
 *
 * Reached by clicking a tile on the Saves grid. It is the SAME reel UI as the
 * feed / Explore / a profile's reel, scoped to the viewer's SAVED posts - not
 * the global home feed. `?post=` opens on the clicked post.
 *
 * Ordering matches the Saves grid: by when the viewer saved each post (newest
 * save first), so scrolling through the reel mirrors the grid order.
 */
export default async function SavedWorkReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>
}) {
  const { post } = await searchParams

  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const saved = await prisma.savedWork.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      workPost: {
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
      },
    },
  })

  const posts = saved.map((s) => s.workPost).filter(Boolean)
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
      viewerId={user.id}
      focusPostId={post ?? null}
      emptyMessage="You have not saved any work yet."
    />
  )
}
