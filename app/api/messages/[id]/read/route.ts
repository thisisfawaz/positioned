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

  const contact = await prisma.contactRequest.findUnique({ where: { id } })
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (contact.fromUserId !== user.id && contact.toUserId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const isRecipient = contact.toUserId === user.id

  const data: Record<string, unknown> = isRecipient
    ? { toUserLastReadAt: now }
    : { fromUserLastReadAt: now }

  if (isRecipient && contact.status === 'PENDING') {
    data.status = 'READ'
    data.readAt = now
  }

  await prisma.contactRequest.update({ where: { id }, data })

  return NextResponse.json({ ok: true })
}
