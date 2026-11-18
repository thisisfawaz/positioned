import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user: sbUser },
  } = await supabase.auth.getUser()
  if (!sbUser) return NextResponse.json({ workPosts: [] }, { status: 401 })

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: sbUser.id },
  })
  if (!profile) return NextResponse.json({ workPosts: [] })

  const workPosts = await prisma.workPost.findMany({
    where: { professionalId: profile.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ workPosts })
}
