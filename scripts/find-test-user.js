const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'PROFESSIONAL' },
    select: {
      email: true,
      name: true,
      professionalProfile: {
        select: { _count: { select: { workPosts: true } } },
      },
    },
    take: 10,
  })

  console.log(
    JSON.stringify(
      users.map((u) => ({
        email: u.email,
        name: u.name,
        posts: u.professionalProfile?._count.workPosts ?? 0,
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
