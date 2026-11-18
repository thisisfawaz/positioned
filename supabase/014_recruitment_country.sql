-- 014_recruitment_country.sql
-- Country field for roles, mirroring ProfessionalProfile.country. Additive only.

BEGIN;

ALTER TABLE "Recruitment"
    ADD COLUMN IF NOT EXISTS "country" TEXT;

COMMIT;
