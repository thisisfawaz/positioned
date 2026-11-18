import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const post = await prisma.recruitment.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.recruitmentLike.findUnique({
      where: { userId_recruitmentId: { userId: user.id, recruitmentId: id } },
      select: { id: true },
    })

    if (existing) {
      const updated = await tx.recruitment.findUnique({
        where: { id },
        select: { likes: true },
      })
      return { liked: true, likes: updated?.likes ?? 0 }
    }

    await tx.recruitmentLike.create({
      data: { userId: user.id, recruitmentId: id },
    })
    const updated = await tx.recruitment.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    })
    return { liked: true, likes: updated.likes }
  })

  return NextResponse.json(result)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.recruitmentLike.findUnique({
      where: { userId_recruitmentId: { userId: user.id, recruitmentId: id } },
      select: { id: true },
    })

    if (!existing) {
      const current = await tx.recruitment.findUnique({
        where: { id },
        select: { likes: true },
      })
      return { liked: false, likes: current?.likes ?? 0 }
    }

    await tx.recruitmentLike.delete({ where: { id: existing.id } })
    const updated = await tx.recruitment.update({
      where: { id },
      data: { likes: { decrement: 1 } },
      select: { likes: true },
    })
    return { liked: false, likes: Math.max(0, updated.likes) }
  })

  return NextResponse.json(result)
}
