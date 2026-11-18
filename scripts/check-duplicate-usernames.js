// One-off diagnostic: are there duplicate usernames that would break the
// unique constraint Prisma wants to add? Read-only - safe to delete.
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const dupes = await prisma.$queryRawUnsafe(`
      SELECT username, COUNT(*)::int AS count
      FROM "User"
      WHERE username IS NOT NULL
      GROUP BY username
      HAVING COUNT(*) > 1
    `)
    const total = await prisma.user.count()
    const withUsername = await prisma.user.count({ where: { username: { not: null } } })

    console.log('total users:', total)
    console.log('users with a username:', withUsername)
    console.log('duplicate usernames:', JSON.stringify(dupes, null, 2))
    if (Array.isArray(dupes) && dupes.length === 0) {
      console.log('RESULT: NO DUPLICATES - unique constraint can be added safely.')
    } else {
      console.log('RESULT: DUPLICATES FOUND - fix these before pushing.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
