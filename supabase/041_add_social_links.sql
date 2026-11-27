ALTER TABLE "ProfessionalProfile"
  ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "behanceUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "dribbbleUrl" TEXT;
