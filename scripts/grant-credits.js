// Grants boost credits directly, bypassing payments.
//
// Usage:
//   node scripts/grant-credits.js <userEmail> <amount>
//
// Exists because checkout is not built. Not a feature - do not wire this to
// any user-facing surface.

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const [email, amountArg] = process.argv.slice(2)

  if (!email || !amountArg) {
    console.error('Usage: node scripts/grant-credits.js <userEmail> <amount>')
    process.exitCode = 1
    return
  }

  const amount = Number(amountArg)
  if (!Number.isFinite(amount) || amount === 0) {
    console.error('amount must be a non-zero number')
    process.exitCode = 1
    return
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, boostCredits: true },
  })
  if (!user) {
    console.error(`No user with email ${email}`)
    process.exitCode = 1
    return
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { boostCredits: { increment: amount } },
    select: { boostCredits: true },
  })

  console.log(
    JSON.stringify(
      {
        user: user.name,
        granted: amount,
        balanceBefore: user.boostCredits,
        balanceAfter: updated.boostCredits,
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
