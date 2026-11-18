-- Backfill: mirror Prisma user.role into Supabase auth.users raw_user_meta_data.
--
-- Run this ONCE in the Supabase SQL editor after deploying the metadata write in
-- lib/auth/ensure-user.ts. It only fills in users that have no role in metadata
-- yet, so it is safe to re-run.
--
-- The app reads role from session.user.user_metadata.role first and only falls
-- back to a Prisma query when it is absent.
--
-- NOTE ON THE CAST: public."User".id is TEXT (Prisma `id String @id`), but
-- auth.users.id is UUID. Comparing them directly fails with
--   42883 operator does not exist: text = uuid
-- so the uuid side is cast to text. This is the same text/uuid rule that
-- applies to auth.uid() in migration 015.

UPDATE auth.users u
SET raw_user_meta_data =
  COALESCE(u.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', p.role::text)
FROM public."User" p
WHERE p.id = u.id::text
  AND COALESCE(u.raw_user_meta_data ->> 'role', '') = '';
