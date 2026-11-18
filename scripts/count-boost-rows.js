const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const [boosts, slots, payments] = await Promise.all([
    prisma.visibilityBoost.count(),
    prisma.visibilitySlot.count(),
    prisma.payment.count(),
  ])
  console.log(JSON.stringify({ boosts, slots, payments }))
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
