// Read-only: does WorkPost.applyUrl exist, and are any APPLY posts missing it?
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const cols = await prisma.$queryRawUnsafe(
      "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'WorkPost' AND column_name = 'applyUrl'"
    )
    console.log('column:', JSON.stringify(cols))

    const applyPosts = await prisma.workPost.findMany({
      where: { desiredResponse: 'APPLY' },
      select: { id: true, title: true, applyUrl: true, desiredResponse: true },
    })
    console.log('APPLY posts:', applyPosts.length)
    console.log(JSON.stringify(applyPosts, null, 2))

    const missing = applyPosts.filter((p) => !p.applyUrl)
    console.log('APPLY posts with NO applyUrl:', missing.length)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('VERIFY FAILED:', e.message)
  process.exit(1)
})
