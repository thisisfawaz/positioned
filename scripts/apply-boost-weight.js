// Applies supabase/027_boost_weight.sql and reports the result.
//
// Same pattern as scripts/apply-boost-credits.js: this project has no Prisma
// migrations folder, SQL in supabase/ is applied by hand, and a schema change
// that is not applied leaves Prisma querying a column that does not exist.
//
// Idempotent (ADD COLUMN IF NOT EXISTS).

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function columns() {
  return prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Boost'
      AND column_name = 'weight';
  `)
}

async function main() {
  const before = await columns()
  console.log('BEFORE:', JSON.stringify(before, null, 2))

  if (before.length === 1) {
    console.log('Column already present - nothing to do.')
    return
  }

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Boost"
      ADD COLUMN IF NOT EXISTS "weight" INTEGER NOT NULL DEFAULT 1;
  `)

  const after = await columns()
  console.log('AFTER:', JSON.stringify(after, null, 2))

  if (after.length !== 1) {
    throw new Error('Expected Boost.weight to exist after the ALTER')
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
