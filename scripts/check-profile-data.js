const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const pros = await prisma.professionalProfile.findMany({
    select: {
      title: true,
      bio: true,
      user: { select: { email: true, name: true } },
    },
    take: 10,
  })

  const recs = await prisma.recruiterProfile.findMany({
    select: {
      organization: true,
      bio: true,
      user: { select: { email: true, name: true } },
    },
    take: 10,
  })

  console.log('PROFESSIONALS:')
  console.log(
    JSON.stringify(
      pros.map((p) => ({
        email: p.user.email,
        title: p.title ?? '(null)',
        bio: p.bio ? p.bio.slice(0, 40) + (p.bio.length > 40 ? '...' : '') : '(null)',
      })),
      null,
      2
    )
  )

  console.log('\nRECRUITERS:')
  console.log(
    JSON.stringify(
      recs.map((r) => ({
        email: r.user.email,
        organization: r.organization ?? '(null)',
        bio: r.bio ? r.bio.slice(0, 40) + (r.bio.length > 40 ? '...' : '') : '(null)',
      })),
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
