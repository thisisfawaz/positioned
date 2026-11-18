// Verifies migration 029 landed: the table is queryable through Prisma.
// Read-only.
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const count = await prisma.documentRequest.count()
    console.log('DocumentRequest table EXISTS - row count:', count)

    const rows = await prisma.documentRequest.findMany({ take: 1 })
    console.log('query OK, sample:', JSON.stringify(rows))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('VERIFY FAILED:', e.message)
  process.exit(1)
})
