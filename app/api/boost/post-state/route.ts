import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/db'
import { isPremiumActive, PREMIUM_BOOST_SLOTS } from '@/lib/premium'

export const dynamic = 'force-dynamic'

/**
 * Boost state for ONE post, for the owner's 3-dots menu.
 *
 * Returns:
 *   premium    - whether the viewer is a premium professional
 *   boosted    - whether this post is currently in their active boost
 *   slotsUsed  - how many posts are in the active boost right now
 *   slotsMax   - the premium boost slot cap (4)
 */
export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'not_signed_in' }, { status: 401 })

  const postId = new URL(request.url).searchParams.get('postId')
  if (!postId) return NextResponse.json({ error: 'missing_postId' }, { status: 400 })

  if (user.role !== 'PROFESSIONAL') {
    return NextResponse.json({ premium: false, boosted: false, slotsUsed: 0, slotsMax: PREMIUM_BOOST_SLOTS })
  }

  const premium = isPremiumActive((user as any).premiumUntil)

  const now = new Date()
  const boost = await prisma.boost.findFirst({
    where: { userId: user.id, status: 'ACTIVE', startsAt: { lte: now }, expiresAt: { gt: now } },
    select: { id: true, posts: { select: { workPostId: true } } },
  })

  const boostedIds = boost?.posts.map((p) => p.workPostId) ?? []

  return NextResponse.json({
    premium,
    boosted: boostedIds.includes(postId),
    slotsUsed: boostedIds.length,
    slotsMax: PREMIUM_BOOST_SLOTS,
  })
}
