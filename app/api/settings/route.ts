import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const BOOLEAN_KEYS = [
  'notifyMessages',
  'notifyList',
  'notifyRoles',
  'profileVisible',
  'allowRecruiterMessages',
  'autoplayVideo',
] as const

type BooleanKey = (typeof BOOLEAN_KEYS)[number]

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Upsert-on-read keeps callers from having to handle a missing row.
  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  })

  return NextResponse.json({ settings })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only known boolean keys are accepted; anything else is ignored rather than
  // written blindly to the database.
  const data: Record<string, unknown> = {}
  for (const key of BOOLEAN_KEYS) {
    if (key in body) {
      if (typeof body[key] !== 'boolean') {
        return NextResponse.json({ error: `${key} must be a boolean` }, { status: 400 })
      }
      data[key] = body[key] as boolean
    }
  }

  // Theme is the one non-boolean setting; validated against a fixed list so no
  // arbitrary string reaches the database.
  if ('themeMode' in body) {
    const mode = body.themeMode
    if (mode !== 'light' && mode !== 'dark' && mode !== 'system') {
      return NextResponse.json(
        { error: 'themeMode must be light, dark or system' },
        { status: 400 }
      )
    }
    data.themeMode = mode
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 })
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  })

  return NextResponse.json({ settings })
}
