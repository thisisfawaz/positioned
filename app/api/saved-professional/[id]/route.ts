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
  if (id === user.id) {
    return NextResponse.json({ error: 'Cannot save yourself' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.savedProfessional.findUnique({
    where: {
      recruiterId_professionalId: {
        recruiterId: user.id,
        professionalId: id,
      },
    },
    select: { id: true },
  })

  if (!existing) {
    await prisma.savedProfessional.create({
      data: { recruiterId: user.id, professionalId: id },
    })
  }

  return NextResponse.json({ saved: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.savedProfessional.deleteMany({
    where: { recruiterId: user.id, professionalId: id },
  })

  return NextResponse.json({ saved: false })
}
