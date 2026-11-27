-- Optional website link for recruiter profiles. Purely optional: it does not
-- satisfy any "at least one social link" rule and renders as an extra button
-- beside View portfolio when filled. Additive and idempotent.

ALTER TABLE "RecruiterProfile"
  ADD COLUMN IF NOT EXISTS "website" TEXT;
