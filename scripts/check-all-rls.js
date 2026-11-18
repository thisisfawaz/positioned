const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT c.relname AS table_name,
           c.relrowsecurity AS rls_enabled,
           (SELECT COUNT(*) FROM pg_policies p
             WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS policy_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relrowsecurity ASC, c.relname ASC;
  `)

  const json = rows.map((r) => ({
    table: r.table_name,
    rls: r.rls_enabled,
    policies: Number(r.policy_count),
  }))

  const unprotected = json.filter((r) => !r.rls)
  console.log('total tables:', json.length)
  console.log('rls DISABLED:', unprotected.length)
  console.log(JSON.stringify(unprotected, null, 2))
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
