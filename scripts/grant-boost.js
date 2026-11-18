// Grants a boost directly, bypassing payments.
//
// Usage:
//   node scripts/grant-boost.js <userEmail> <days> [postIds...]
//
// With no postIds, every PUBLISHED work post by that user is boosted.
// This exists to TEST the rotation. It is not a feature and should not be
// wired to any user-facing surface.

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const HOUR_MS = 60 * 60 * 1000

async function main() {
  const [email, daysArg, ...postIds] = process.argv.slice(2)

  if (!email || !daysArg) {
    console.error('Usage: node scripts/grant-boost.js <userEmail> <days> [postIds...]')
    process.exitCode = 1
    return
  }

  const days = Number(daysArg)
  if (!Number.isFinite(days) || days < 1) {
    console.error('days must be a positive number')
    process.exitCode = 1
    return
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, role: true },
  })
  if (!user) {
    console.error(`No user with email ${email}`)
    process.exitCode = 1
    return
  }

  if (user.role !== 'PROFESSIONAL') {
    console.error(
      `User ${email} is ${user.role}. Only professionals can boost right now - ` +
        'recruiter boosting is a separate, unbuilt product.'
    )
    process.exitCode = 1
    return
  }

  // An active boost already running would violate the one-boost-at-a-time rule.
  const now = new Date()
  const existing = await prisma.boost.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
      startsAt: { lte: now },
      expiresAt: { gt: now },
    },
    select: { id: true, expiresAt: true },
  })
  if (existing) {
    console.error(
      `${email} already has an active boost until ${existing.expiresAt.toISOString()}`
    )
    process.exitCode = 1
    return
  }

  // Resolve which posts to boost.
  let workPostIds = postIds
  if (workPostIds.length === 0) {
    const prof = await prisma.professionalProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!prof) {
      console.error(`${email} has no professional profile`)
      process.exitCode = 1
      return
    }
    const posts = await prisma.workPost.findMany({
      where: { professionalId: prof.id, status: 'PUBLISHED' },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    workPostIds = posts.map((p) => p.id)
  }

  if (workPostIds.length === 0) {
    console.error(`${email} has no published work posts to boost`)
    process.exitCode = 1
    return
  }

  const boost = await prisma.boost.create({
    data: {
      userId: user.id,
      amount: days,
      currency: 'USD',
      days,
      startsAt: now,
      expiresAt: new Date(now.getTime() + days * 24 * HOUR_MS),
      posts: { create: workPostIds.map((workPostId) => ({ workPostId })) },
    },
  })

  console.log(
    JSON.stringify(
      {
        granted: boost.id,
        user: email,
        days,
        startsAt: boost.startsAt.toISOString(),
        expiresAt: boost.expiresAt.toISOString(),
        posts: workPostIds.length,
      },
      null,
      2
    )
  )
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
