-- Recruiter profile: bio + recruiting status.
--
-- role is intentionally NOT dropped. It is only removed from the form, so the
-- column stays and existing values remain readable. Dropping it is a separate,
-- destructive decision.

ALTER TABLE "RecruiterProfile"
  ADD COLUMN IF NOT EXISTS "bio" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RecruitingStatus') THEN
    CREATE TYPE "RecruitingStatus" AS ENUM ('CURRENTLY_RECRUITING', 'NOT_RECRUITING');
  END IF;
END $$;

ALTER TABLE "RecruiterProfile"
  ADD COLUMN IF NOT EXISTS "recruitingStatus" "RecruitingStatus"
  NOT NULL DEFAULT 'CURRENTLY_RECRUITING';
