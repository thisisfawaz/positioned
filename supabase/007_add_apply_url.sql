-- 007_add_apply_url.sql
-- External link where applicants apply. Additive only.

BEGIN;

ALTER TABLE "Recruitment"
    ADD COLUMN IF NOT EXISTS "applyUrl" TEXT;

COMMIT;
