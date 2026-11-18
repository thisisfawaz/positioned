// Diagnostic: what is actually in the database right now? Read-only.
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const userConstraints = await prisma.$queryRawUnsafe(`
      SELECT conname, contype
      FROM pg_constraint
      WHERE conrelid = '"User"'::regclass
      ORDER BY conname
    `)
    console.log('User constraints:', JSON.stringify(userConstraints, null, 2))

    const userIndexes = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'User'
      ORDER BY indexname
    `)
    console.log('User indexes:', JSON.stringify(userIndexes, null, 2))

    const workPostCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'WorkPost'
      ORDER BY ordinal_position
    `)
    console.log('WorkPost columns:', JSON.stringify(workPostCols, null, 2))

    const enums = await prisma.$queryRawUnsafe(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typname IN ('ResponseType', 'PostMediaType')
      ORDER BY t.typname, e.enumsortorder
    `)
    console.log('New enums:', JSON.stringify(enums, null, 2))

    const migrationsTable = await prisma.$queryRawUnsafe(`
      SELECT to_regclass('public._prisma_migrations') AS exists
    `)
    console.log('_prisma_migrations table:', JSON.stringify(migrationsTable, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
