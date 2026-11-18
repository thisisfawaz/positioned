// Verifies the WorkPost query that previously failed with P2022 now works.
// Read-only.
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const posts = await prisma.workPost.findMany({
      where: { status: 'PUBLISHED' },
      take: 3,
      select: {
        id: true,
        title: true,
        recruiterProfileId: true,
        desiredResponse: true,
        mediaType: true,
        videoUrl: true,
        template: true,
        professionalId: true,
      },
    })
    console.log('QUERY OK - rows returned:', posts.length)
    console.log(JSON.stringify(posts, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('QUERY FAILED:', e.message)
  process.exit(1)
})
