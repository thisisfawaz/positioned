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

  const post = await prisma.workPost.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.savedWork.findUnique({
      where: { userId_workPostId: { userId: user.id, workPostId: id } },
      select: { id: true },
    })

    if (existing) {
      const updated = await tx.workPost.findUnique({
        where: { id },
        select: { saves: true },
      })
      return { saved: true, saves: updated?.saves ?? 0 }
    }

    await tx.savedWork.create({ data: { userId: user.id, workPostId: id } })
    const updated = await tx.workPost.update({
      where: { id },
      data: { saves: { increment: 1 } },
      select: { saves: true },
    })
    return { saved: true, saves: updated.saves }
  })

  return NextResponse.json(result)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.savedWork.findUnique({
      where: { userId_workPostId: { userId: user.id, workPostId: id } },
      select: { id: true },
    })

    if (!existing) {
      const current = await tx.workPost.findUnique({
        where: { id },
        select: { saves: true },
      })
      return { saved: false, saves: current?.saves ?? 0 }
    }

    await tx.savedWork.delete({ where: { id: existing.id } })
    const updated = await tx.workPost.update({
      where: { id },
      data: { saves: { decrement: 1 } },
      select: { saves: true },
    })
    return { saved: false, saves: Math.max(0, updated.saves) }
  })

  return NextResponse.json(result)
}
