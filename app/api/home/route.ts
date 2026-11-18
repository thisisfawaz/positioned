import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { boostedPostForViewer, recordImpression } from '@/services/boosts/schedule'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()

  // getSession() decodes the JWT from the cookie locally; getUser() would make
  // a network round-trip to Supabase on every feed load.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const sbUser = session?.user

  // Everything below is independent of auth, so it runs in one parallel batch.
  // ONE post model. The Recruitment table is retired; a vacancy is a WorkPost.
  const [workPosts] = await Promise.all([
    prisma.workPost.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        // Explicit: without this the card receives no media and silently
        // renders a post with no image.
        mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 },
        // ONE post model: the owner is EITHER a professional or a recruiter.
        // Both are included so the card can render whichever one owns it.
        professional: {
          include: {
            user: true,
            skills: { include: { skill: true } },
          },
        },
        recruiterProfile: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    }),
  ])

  if (!sbUser) {
    return NextResponse.json({
      workPosts,
      followingIds: [],
      viewerId: null,
      viewerSkills: [],
      viewerTitle: '',
      viewerBio: '',
      viewerInterests: [],
      viewerRole: null,
      boostedPostId: null,
    })
  }

  const ids = workPosts.map((p) => p.id)

  // All viewer-scoped reads at once instead of chained awaits.
  const [me, follows, likes, saves, documentRequests] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: sbUser.id },
        select: {
          role: true,
          professionalProfile: {
            select: {
              title: true,
              bio: true,
              skills: { select: { skill: { select: { name: true } } } },
            },
          },
          recruiterProfile: { select: { hiringInterests: true } },
        },
      }),
      prisma.follow.findMany({
        where: { followerId: sbUser.id },
        select: { followingId: true },
      }),
      prisma.like.findMany({
        where: { userId: sbUser.id, workPostId: { in: ids } },
        select: { workPostId: true },
      }),
      prisma.savedWork.findMany({
        where: { userId: sbUser.id, workPostId: { in: ids } },
        select: { workPostId: true },
      }),

      // Which posts THIS viewer has a document request on. STATUS MATTERS:
      //   PENDING   -> a row exists but nobody has supplied links yet. The CTA
      //                must still ask for them, not claim "Submitted".
      //   FULFILLED -> links exist, so the CTA links to /requests.
      // Returning only postIds (as this used to) made a just-clicked, still
      // empty request look submitted after a refresh.
      ids.length
        ? prisma.documentRequest.findMany({
            where: { requesterId: sbUser.id, postId: { in: ids } },
            select: { id: true, postId: true, status: true },
          })
        : Promise.resolve([]),
    ])

  const likedSet = new Set(likes.map((l) => l.workPostId))
  const savedSet = new Set(saves.map((s) => s.workPostId))

  // postId -> the PENDING request's id, so the card can open the form for it
  // after a refresh without creating a duplicate.
  const pendingRequestByPost: Record<string, string> = {}
  const fulfilledPostIds: string[] = []
  for (const r of documentRequests) {
    if (r.status === 'FULFILLED') fulfilledPostIds.push(r.postId)
    else pendingRequestByPost[r.postId] = r.id
  }

  const viewerSkills =
    me?.professionalProfile?.skills.map((s) => s.skill.name) ?? []

  // Which boosted post this VIEWER should see at the top, if any. Assignment is
  // per viewer, so different people see different boosters at the same moment.
  // A user is never shown their own boosted post - it wastes the impression and
  // looks broken to them.
  let boostedPostId: string | null = null
  try {
    // Set by the Vercel edge, not the client, so it cannot be spoofed. Absent
    // in local dev - the resolver treats null as "match every country".
    const viewerCountry = request.headers.get('x-vercel-ip-country')
    const pick = await boostedPostForViewer(
      sbUser.id,
      me?.role ?? null,
      new Date(),
      viewerCountry
    )
    if (pick && !workPosts.some((p) => p.id === pick.workPostId && p.professional?.userId === sbUser.id)) {
      const ownPost = workPosts.find((p) => p.id === pick.workPostId)
      if (!ownPost || ownPost.professional?.userId !== sbUser.id) {
        boostedPostId = pick.workPostId
        await recordImpression({
          boostId: pick.boostId,
          workPostId: pick.workPostId,
          viewerId: sbUser.id,
          viewerRole: me?.role ?? null,
          surface: 'FEED',
        })
      }
    }
  } catch (err) {
    // A boost failure must never break the feed.
    console.error('[home] boost assignment failed:', err)
  }

  return NextResponse.json({
    workPosts: workPosts.map((post) => ({
      ...post,
      likedByMe: likedSet.has(post.id),
      savedByMe: savedSet.has(post.id),
    })),

    followingIds: follows.map((f) => f.followingId),
    viewerId: sbUser.id,
    viewerSkills,
    viewerTitle: me?.professionalProfile?.title ?? '',
    viewerBio: me?.professionalProfile?.bio ?? '',
    viewerInterests: (me?.recruiterProfile?.hiringInterests ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    viewerRole: me?.role ?? null,
    boostedPostId,
    // Two lists, not one: pending posts still need a link, fulfilled ones do not.
    pendingRequestByPost,
    fulfilledPostIds,
  })
}
