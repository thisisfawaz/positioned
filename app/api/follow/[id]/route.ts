import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.id === id) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
  }

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: user.id, followingId: id } },
    create: { followerId: user.id, followingId: id },
    update: {},
  })

  return NextResponse.json({ following: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.follow.deleteMany({
    where: { followerId: user.id, followingId: id },
  })

  return NextResponse.json({ following: false })
}
