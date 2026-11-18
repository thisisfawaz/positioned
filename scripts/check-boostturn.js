const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
      AND c.relname ILIKE '%boost%'
    ORDER BY c.relname;
  `)

  const rows = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int AS n FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'BoostTurn';
  `)

  console.log(JSON.stringify({ tables, boostTurnTableCount: rows[0]?.n ?? null }, (k, v) => (typeof v === 'bigint' ? v.toString() : v), 2))
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
