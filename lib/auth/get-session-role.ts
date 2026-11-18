import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

/**
 * Returns the viewer's role for shell rendering.
 *
 * Fast path: role is in Supabase user metadata (written at signup and backfilled
 * by supabase/016_backfill_role_metadata.sql), so this is a local JWT decode and
 * no database round-trip.
 *
 * Slow path: metadata has no role yet - fall back to a single Prisma read so
 * existing accounts keep working before the backfill runs.
 */
export type SessionRole = 'PROFESSIONAL' | 'RECRUITER' | 'ADMIN'

function toRole(value: unknown): SessionRole | null {
  return value === 'PROFESSIONAL' || value === 'RECRUITER' || value === 'ADMIN'
    ? value
    : null
}

export async function getSessionRole(): Promise<{
  userId: string | null
  role: SessionRole | null
  name: string | null
}> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  if (!user) return { userId: null, role: null, name: null }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const metaRole = toRole(meta.role)
  const metaName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    null

  if (metaRole) {
    return { userId: user.id, role: metaRole, name: metaName }
  }

  // Fallback for accounts created before the metadata write existed.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true },
  })

  return {
    userId: user.id,
    role: toRole(dbUser?.role),
    name: dbUser?.name ?? metaName,
  }
}
