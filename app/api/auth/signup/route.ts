import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensurePrismaUser } from '@/lib/auth/ensure-user'

export const dynamic = 'force-dynamic'

type Body = {
  name?: string
  email?: string
  password?: string
  userType?: 'professional' | 'recruiter'
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password
  const userType = body.userType === 'recruiter' ? 'recruiter' : 'professional'

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Name, email and password are required.' },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  })

  if (error) {
    const message =
      error.message.includes('already registered') ||
      error.message.includes('already been registered')
        ? 'An account with this email already exists.'
        : error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (!data.user) {
    return NextResponse.json(
      { error: 'Account could not be created. Please try again.' },
      { status: 500 }
    )
  }

  // Email confirmation may be enabled, in which case there is no session yet.
  const needsEmailConfirmation = !data.session

  try {
    await ensurePrismaUser(data.user, userType, name)
  } catch (err) {
    console.error('[signup] failed to create Prisma user:', err)
    return NextResponse.json(
      {
        error:
          'Your account was created but your profile could not be set up. Please contact support.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    needsEmailConfirmation,
  })
}
