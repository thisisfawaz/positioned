import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const workPosts = await prisma.workPost.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      mediaAssets: { orderBy: { createdAt: 'asc' }, take: 1 },
      professional: {
        include: {
          user: true,
          skills: { include: { skill: true } },
        },
      },
    },
    orderBy: [{ boosted: 'desc' }, { createdAt: 'desc' }],
    take: 20,
  })

  return NextResponse.json({ workPosts })
}
