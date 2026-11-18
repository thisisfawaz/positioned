import { prisma } from '@/lib/db'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type UserType = 'professional' | 'recruiter'

/**
 * Builds a starting handle from the display name: first word, lowercase,
 * alphanumerics only, plus 3-5 random digits. Retries until unique.
 */
async function generateUsername(name: string): Promise<string> {
  const base =
    name
      .trim()
      .split(/\s+/)[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') || 'user'

  for (let attempt = 0; attempt < 10; attempt++) {
    const digits = String(Math.floor(100 + Math.random() * 90000))
    const candidate = `${base}${digits}`
    const taken = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    })
    if (!taken) return candidate
  }

  // Fallback: timestamp suffix guarantees uniqueness
  return `${base}${Date.now().toString().slice(-6)}`
}

/**
 * Ensures a Prisma User row exists for the given Supabase user.
 * If the user is brand new and a `role` is provided, it also creates
 * the corresponding ProfessionalProfile or RecruiterProfile.
 *
 * Returns the Prisma user, plus a flag indicating whether it was just created.
 */
export async function ensurePrismaUser(
  supabaseUser: SupabaseUser,
  role?: UserType | null,
  displayName?: string
) {
  const email = supabaseUser.email
  if (!email) {
    throw new Error('Supabase user has no email')
  }

  // 1. Check if the user already exists
  const existing = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    include: {
      professionalProfile: true,
      recruiterProfile: true,
    },
  })

  if (existing) {
    return { user: existing, created: false }
  }

  // 2. New user — derive a display name from Google metadata
  const metadata = supabaseUser.user_metadata ?? {}
  const name =
    displayName?.trim() ||
    metadata.full_name ||
    metadata.name ||
    email.split('@')[0]

  // 3. Determine role — default to professional if not provided
  const userRole = role === 'recruiter' ? 'RECRUITER' : 'PROFESSIONAL'

  // 3b. Give every new user a starting handle so their profile has a URL
  const username = await generateUsername(name)

  // 3c. Mirror the role into Supabase metadata. The app layout reads it from
  // the session to decide which rail/tools to render WITHOUT a Prisma query.
  // Without this, every page render has to wait for the DB.
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.auth.updateUser({ data: { role: userRole } })
  } catch (err) {
    // Non-fatal: the layout falls back to the Prisma role.
    console.error('[ensurePrismaUser] could not mirror role to metadata:', err)
  }

  // 4. Create user + profile in a transaction
  const created = await prisma.user.create({
    data: {
      id: supabaseUser.id,
      email,
      name,
      username,
      role: userRole,
      ...(userRole === 'PROFESSIONAL'
        ? {
            professionalProfile: {
              create: {},
            },
          }
        : {
            recruiterProfile: {
              create: {},
            },
          }),
    },
    include: {
      professionalProfile: true,
      recruiterProfile: true,
    },
  })

  return { user: created, created: true }
}
