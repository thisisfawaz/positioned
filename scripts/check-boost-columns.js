const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('Boost','BoostPost','BoostImpression')
      AND column_name IN ('status','surface','viewerRole')
    ORDER BY table_name, column_name;
  `)

  const types = await prisma.$queryRawUnsafe(`
    SELECT typname, typtype FROM pg_type WHERE typname IN ('BoostStatus','BoostSurface');
  `)

  console.log(
    JSON.stringify(
      { columns: cols, enumTypes: types },
      (k, v) => (typeof v === 'bigint' ? v.toString() : v),
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
