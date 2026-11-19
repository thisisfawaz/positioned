-- Recruiters can now have a profile photo, matching professionals.
--
-- APPLIED AS RAW SQL, not `prisma db push`: the live database has a PARTIAL
-- unique index on User.username that Prisma's snapshot does not recognise, so
-- `db push` tries to recreate it and Postgres refuses. Every migration since
-- that was discovered has been applied this way. See PROJECT_NOTES.md.

ALTER TABLE "RecruiterProfile"
  ADD COLUMN IF NOT EXISTS "profilePhoto" TEXT;
