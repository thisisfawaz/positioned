import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const q = (searchParams.get('q') ?? '').trim()
  const organization = (searchParams.get('organization') ?? '').trim()
  const location = (searchParams.get('location') ?? '').trim()
  const verifiedOnly = searchParams.get('verified') === 'true'
  const take = Math.min(Number(searchParams.get('take') ?? 50) || 50, 100)

  // Same rule as the professionals directory: no settings row means visible.
  const where: Prisma.RecruiterProfileWhereInput = {
    user: {
      OR: [{ settings: { is: null } }, { settings: { is: { profileVisible: true } } }],
    },
  }

  if (q) {
    where.OR = [
      { organization: { contains: q, mode: 'insensitive' } },
      { role: { contains: q, mode: 'insensitive' } },
      { hiringInterests: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
    ]
  }

  if (organization) {
    where.organization = { contains: organization, mode: 'insensitive' }
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' }
  }

  if (verifiedOnly) {
    where.isVerified = true
  }

  const recruiters = await prisma.recruiterProfile.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take,
    select: {
      id: true,
      userId: true,
      organization: true,
      role: true,
      location: true,
      hiringInterests: true,
      recruitingStatus: true,
      isVerified: true,
      user: { select: { id: true, name: true, username: true } },
    },
  })

  return NextResponse.json({ recruiters })
}
