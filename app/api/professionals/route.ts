import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const q = (searchParams.get('q') ?? '').trim()
  const skill = (searchParams.get('skill') ?? '').trim()
  const location = (searchParams.get('location') ?? '').trim()
  const availability = (searchParams.get('availability') ?? '').trim()
  const take = Math.min(Number(searchParams.get('take') ?? 50) || 50, 100)

  // Hidden profiles are excluded from discovery. A user with no settings row
  // is treated as visible, so this must be "visible OR no row", not "visible".
  const where: Prisma.ProfessionalProfileWhereInput = {
    user: {
      OR: [{ settings: { is: null } }, { settings: { is: { profileVisible: true } } }],
    },
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { bio: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { skills: { some: { skill: { name: { contains: q, mode: 'insensitive' } } } } },
    ]
  }

  if (skill) {
    where.skills = {
      some: { skill: { name: { contains: skill, mode: 'insensitive' } } },
    }
  }

  if (location) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { location: { contains: location, mode: 'insensitive' } },
          { country: { contains: location, mode: 'insensitive' } },
        ],
      },
    ]
  }

  if (availability && availability !== 'ANY') {
    if (availability === 'AVAILABLE') {
      where.availability = { not: 'NOT_AVAILABLE' }
    } else {
      where.availability = availability as Prisma.ProfessionalProfileWhereInput['availability']
    }
  }

  const professionals = await prisma.professionalProfile.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take,
    select: {
      id: true,
      userId: true,
      title: true,
      bio: true,
      location: true,
      country: true,
      profilePhoto: true,
      availability: true,
      user: { select: { id: true, name: true, username: true } },
      skills: { select: { skill: { select: { name: true } } }, take: 5 },
    },
  })

  return NextResponse.json({ professionals })
}
