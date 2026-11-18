// Read-only: what did the newest posts actually save?
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const posts = await prisma.workPost.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        caption: true,
        desiredResponse: true,
        mediaType: true,
        videoUrl: true,
        professionalId: true,
        recruiterProfileId: true,
        createdAt: true,
        mediaAssets: { select: { providerAssetId: true } },
      },
    })
    console.log(JSON.stringify(posts, null, 2))

    for (const p of posts) {
      let ownerUserId = null
      if (p.professionalId) {
        const prof = await prisma.professionalProfile.findUnique({
          where: { id: p.professionalId },
          select: { userId: true },
        })
        ownerUserId = prof?.userId ?? null
      } else if (p.recruiterProfileId) {
        const rec = await prisma.recruiterProfile.findUnique({
          where: { id: p.recruiterProfileId },
          select: { userId: true },
        })
        ownerUserId = rec?.userId ?? null
      }
      console.log(p.id, 'owner user:', ownerUserId)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
