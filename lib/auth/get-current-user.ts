import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

/**
 * Returns the current signed-in Prisma user with their profile.
 * Wrapped in React.cache() so it only runs once per request.
 *
 * If the database is temporarily unreachable, returns null instead of
 * crashing the page. Callers should treat null as "user not available".
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()

  // getSession() decodes the JWT from the cookie locally. getUser() would make a
  // network round-trip to Supabase on every navigation. The tradeoff is that
  // getSession() trusts the cookie without revalidating it server-side, so a
  // revoked session stays valid until the JWT expires.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const supabaseUser = session?.user

  if (!supabaseUser) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: {
        professionalProfile: {
          include: {
            skills: { include: { skill: true } },
            experiences: true,
          },
        },
        recruiterProfile: true,
      },
    })

    return user
  } catch (err) {
    console.error('[getCurrentUser] database error:', err)
    return null
  }
})
