import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user: sbUser },
  } = await supabase.auth.getUser()

  if (!sbUser) return NextResponse.json({ user: null }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: sbUser.id },
    include: {
      professionalProfile: {
        include: {
          skills: { include: { skill: true } },
          experiences: true,
        },
      },
      recruiterProfile: {
        include: { experiences: true },
      },
    },
  })

  return NextResponse.json({ user })
}
