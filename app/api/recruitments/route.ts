import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const q = (searchParams.get('q') ?? '').trim()
  const location = (searchParams.get('location') ?? '').trim()
  const type = (searchParams.get('type') ?? '').trim()
  const organization = (searchParams.get('organization') ?? '').trim()
  const role = (searchParams.get('role') ?? '').trim()
  const country = (searchParams.get('country') ?? '').trim()
  const takeParam = searchParams.get('take')
  const take = Math.min(Number(takeParam ?? 50) || 50, 100)

  const where: Prisma.RecruitmentWhereInput = { status: 'OPEN' }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { requirements: { contains: q, mode: 'insensitive' } },
      { organization: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' }
  }

  if (type) {
    where.employmentType = { equals: type, mode: 'insensitive' }
  }

  if (organization) {
    where.organization = { contains: organization, mode: 'insensitive' }
  }

  if (role) {
    where.title = { contains: role, mode: 'insensitive' }
  }

  if (country) {
    where.country = { contains: country, mode: 'insensitive' }
  }

  const recruitments = await prisma.recruitment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      title: true,
      organization: true,
      location: true,
      country: true,
      employmentType: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ recruitments })
}
