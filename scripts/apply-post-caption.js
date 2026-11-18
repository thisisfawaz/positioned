// Applies supabase/028_post_caption_local_media.sql.
//
// Same pattern as apply-boost-credits.js and apply-boost-weight.js: this
// project has no Prisma migrations folder, SQL in supabase/ is applied by hand.
//
// Idempotent. ALTER TYPE ... ADD VALUE cannot run inside a transaction block on
// older Postgres, so the enum change is executed on its own.

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function captionColumn() {
  return prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkPost'
      AND column_name = 'caption';
  `)
}

async function providerValues() {
  return prisma.$queryRawUnsafe(`
    SELECT e.enumlabel
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'StorageProvider'
    ORDER BY e.enumsortorder;
  `)
}

async function main() {
  console.log('BEFORE columns:', JSON.stringify(await captionColumn()))
  console.log('BEFORE provider:', JSON.stringify(await providerValues()))

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "WorkPost"
      ADD COLUMN IF NOT EXISTS "caption" TEXT;
  `)

  const hasLocal = (await providerValues()).some((r) => r.enumlabel === 'LOCAL')
  if (!hasLocal) {
    await prisma.$executeRawUnsafe(`ALTER TYPE "StorageProvider" ADD VALUE 'LOCAL';`)
  }

  const cols = await captionColumn()
  const vals = await providerValues()
  console.log('AFTER columns:', JSON.stringify(cols))
  console.log('AFTER provider:', JSON.stringify(vals))

  if (cols.length !== 1) throw new Error('Expected WorkPost.caption to exist')
  if (!vals.some((r) => r.enumlabel === 'LOCAL')) {
    throw new Error('Expected StorageProvider.LOCAL to exist')
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
