import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { boostedProfileForViewer, recordImpression } from '@/services/boosts/schedule'

export const dynamic = 'force-dynamic'

/**
 * The boosted professional to pin above the DEFAULT Explore list for this
 * viewer.
 *
 * Deliberately a separate endpoint from /api/professionals: search results are
 * not affected by boosts. If someone searches "designers in Lagos", a boosted
 * profile that does not match must not be pushed to the top - that would make
 * the boost an override of the user's query instead of a suggestion.
 *
 * Assignment is per viewer, so different people see different boosted profiles
 * at the same moment.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const sbUser = session?.user
  if (!sbUser) return NextResponse.json({ profile: null })

  try {
    const me = await prisma.user.findUnique({
      where: { id: sbUser.id },
      select: { role: true },
    })

    // Recruiter-only: professionals browsing Explore see the normal directory.
    // Set by the Vercel edge, not the client. Absent in local dev - the
    // resolver treats null as "match every country".
    const viewerCountry = request.headers.get('x-vercel-ip-country')
    const pick = await boostedProfileForViewer(
      sbUser.id,
      me?.role ?? null,
      new Date(),
      viewerCountry
    )
    if (!pick) return NextResponse.json({ profile: null })

    // Never show someone their own profile as a boost.
    if (pick.userId === sbUser.id) return NextResponse.json({ profile: null })

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: pick.userId },
      select: {
        id: true,
        userId: true,
        title: true,
        bio: true,
        location: true,
        country: true,
        profilePhoto: true,
        availability: true,
        user: { select: { id: true, name: true, username: true } },
        skills: { select: { skill: { select: { name: true } } }, take: 5 },
      },
    })

    // A boosted recruiter has no professional profile - nothing to pin.
    if (!profile) return NextResponse.json({ profile: null })

    await recordImpression({
      boostId: pick.boostId,
      workPostId: null,
      viewerId: sbUser.id,
      viewerRole: me?.role ?? null,
      surface: 'EXPLORE',
    })

    return NextResponse.json({ profile })
  } catch (err) {
    // A boost failure must never break Explore.
    console.error('[explore-boost] failed:', err)
    return NextResponse.json({ profile: null })
  }
}
