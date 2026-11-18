// Applies supabase/026_boost_credits.sql and reports the result.
//
// Exists because this project has no Prisma migrations folder - SQL in
// supabase/ is applied by hand, and a schema change that is not applied leaves
// Prisma querying a column that does not exist (P2022), which surfaces as every
// page 404ing because getCurrentUser() swallows the error and returns null.
//
// Idempotent: the SQL uses ADD COLUMN IF NOT EXISTS.

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function columns() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (table_name = 'User'  AND column_name = 'boostCredits') OR
        (table_name = 'Boost' AND column_name = 'creditsSpent')
      )
    ORDER BY table_name, column_name;
  `)
  return rows
}

async function main() {
  const before = await columns()
  console.log('BEFORE:', JSON.stringify(before, null, 2))

  if (before.length === 2) {
    console.log('Both columns already present - nothing to do.')
    return
  }

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "boostCredits" INTEGER NOT NULL DEFAULT 0;
  `)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Boost"
      ADD COLUMN IF NOT EXISTS "creditsSpent" INTEGER NOT NULL DEFAULT 0;
  `)

  const after = await columns()
  console.log('AFTER:', JSON.stringify(after, null, 2))

  if (after.length !== 2) {
    throw new Error('Expected both columns to exist after the ALTERs')
  }
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
