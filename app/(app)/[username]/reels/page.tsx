import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ReelFeed } from '@/components/work/ReelFeed'

export const dynamic = 'force-dynamic'

/**
 * A PROFILE'S OWN POSTS AS A REEL.
 *
 * Reached by clicking a post on a profile. Shows ONLY that person's published
 * work, newest first, one post per screen, starting at the clicked post. There
 * is no ad splicing and no boost reordering here - this is one person's reel,
 * not the global feed.
 */
export default async function ProfileReelsPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ post?: string }>
}) {
  const { username } = await params
  const { post } = await searchParams

  const user = await prisma.user.findFirst({
    where: { OR: [{ username }, { id: username }] },
    select: {
      id: true,
      name: true,
      username: true,
      professionalProfile: { select: { id: true } },
    },
  })

  if (!user || !user.professionalProfile) notFound()

  const posts = await prisma.workPost.findMany({
    where: { professionalId: user.professionalProfile.id, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
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
      emptyMessage={`${user.name} has not published any work yet.`}
    />
  )
}
