const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Experience'
    ORDER BY ordinal_position;
  `)

  const fks = await prisma.$queryRawUnsafe(`
    SELECT conname FROM pg_constraint
    WHERE conrelid = '"Experience"'::regclass AND contype = 'f';
  `)

  console.log(
    JSON.stringify(
      { columns: cols, foreignKeys: fks },
      (k, v) => (typeof v === 'bigint' ? v.toString() : v),
      2
    )
  )

  const total = await prisma.experience.count()
  console.log('existing experience rows:', total)
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
