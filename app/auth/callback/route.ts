import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensurePrismaUser } from '@/lib/auth/ensure-user'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'professional' | 'recruiter' | null

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  try {
    // Ensure a Prisma user exists for this Supabase user.
    const { created } = await ensurePrismaUser(data.user, type as any)

    // If this is a brand-new user with no role chosen, ask them to pick one.
    if (created && !type) {
      return NextResponse.redirect(`${origin}/auth/complete-profile`)
    }

    return NextResponse.redirect(`${origin}/home`)
  } catch (err) {
    console.error('Failed to ensure Prisma user:', err)
    return NextResponse.redirect(`${origin}/auth/login?error=setup_failed`)
  }
}
