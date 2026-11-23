-- 035: add CLOUDINARY to the StorageProvider enum.
--
-- Applied as raw SQL, NOT `prisma db push`, because of the standing
-- User_username_key partial-index drift described in PROJECT_NOTES.md.
--
-- NOTE: `ALTER TYPE ... ADD VALUE` cannot run inside a transaction block on
-- PostgreSQL < 12. If `npx prisma db execute` complains, run this statement
-- directly against the database (psql / Supabase SQL editor).
--
-- IF NOT EXISTS makes re-running safe.

ALTER TYPE "StorageProvider" ADD VALUE IF NOT EXISTS 'CLOUDINARY';
