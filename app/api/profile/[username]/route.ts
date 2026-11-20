import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export const dynamic = 'force-dynamic'

/**
 * Profile data for the client-cached profile page.
 *
 * Previously `app/(app)/[username]/page.tsx` was a server component doing six
 * SEQUENTIAL Prisma awaits on every navigation, so the profile always felt like
 * a fresh load. This route mirrors the same shape (the client wrapper feeds it
 * straight into ProfileBody) but runs the independent reads in PARALLEL and is
 * served from the SWR memory cache on repeat visits.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const [user, currentUser] = await Promise.all([
    prisma.user.findFirst({
      where: { OR: [{ username }, { id: username }] },
      include: {
        professionalProfile: {
          include: { skills: { include: { skill: true } }, experiences: true },
        },
        recruiterProfile: { include: { experiences: true } },
      },
    }),
    getCurrentUser(),
  ])

  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const isOwn = currentUser?.id === user.id
  const prof = user.professionalProfile
  const recruiter = user.recruiterProfile
  const isRecruiter = user.role === 'RECRUITER'

  const [onList, posts, roles] = await Promise.all([
    currentUser
      ? prisma.follow
          .findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUser.id,
                followingId: user.id,
              },
            },
            select: { id: true },
          })
          .then(Boolean)
      : Promise.resolve(false),
    prof || recruiter
      ? prisma.workPost.findMany({
          where: {
            status: 'PUBLISHED',
            ...(prof ? { professionalId: prof.id } : { recruiterProfileId: recruiter!.id }),
          },
          orderBy: { createdAt: 'desc' },
          include: { mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 } },
        })
      : Promise.resolve([]),
    isRecruiter
      ? prisma.recruitment.findMany({
          where: { recruiterId: user.id },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
  ])

  return NextResponse.json({
    user: { id: user.id, name: user.name, username: user.username },
    prof,
    recruiter,
    isRecruiter,
    isOwn,
    onList,
    posts,
    roles,
    canFollow: Boolean(currentUser),
  })
}
