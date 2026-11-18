import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ProfileBody } from '@/components/profile/ProfileBody'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const user = await prisma.user.findFirst({
    where: { OR: [{ username }, { id: username }] },
    include: {
      professionalProfile: {
        include: { skills: { include: { skill: true } }, experiences: true },
      },
      recruiterProfile: { include: { experiences: true } },
    },
  })

  if (!user) notFound()

  const currentUser = await getCurrentUser()
  const isOwn = currentUser?.id === user.id
  const prof = user.professionalProfile
  const recruiter = user.recruiterProfile
  const isRecruiter = user.role === 'RECRUITER'

  const onList = currentUser
    ? Boolean(
        await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: user.id,
            },
          },
          select: { id: true },
        })
      )
    : false

  const posts = prof
    ? await prisma.workPost.findMany({
        where: { professionalId: prof.id, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        // The profile grid renders one image per post. Omitting this makes
        // every tile fall back to a gradient with the title - the same silent
        // break the feed notes warn about.
        include: { mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 } },
      })
    : []

  const roles = isRecruiter
    ? await prisma.recruitment.findMany({
        where: { recruiterId: user.id },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="flex-1 min-w-0 w-full px-0 pb-4 pt-3 sm:px-4 lg:px-6">
      <ProfileBody
        user={{ id: user.id, name: user.name, username: user.username }}
        prof={prof}
        recruiter={recruiter}
        isRecruiter={isRecruiter}
        isOwn={isOwn}
        onList={onList}
        posts={posts}
        roles={roles}
        canFollow={Boolean(currentUser)}
      />
    </div>
  )
}
