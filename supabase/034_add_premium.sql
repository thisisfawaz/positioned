-- Premium (Professionals only). premiumUntil NULL/past = not premium.
-- Raw SQL, NOT db push (username partial-index drift still blocks db push).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "premiumUntil" TIMESTAMP(3);
