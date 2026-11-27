-- Optional contact email for recruiter profiles. Purely optional; when set it
-- is shown in the Contact tab on the profile. Additive and idempotent.

ALTER TABLE "RecruiterProfile"
  ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
